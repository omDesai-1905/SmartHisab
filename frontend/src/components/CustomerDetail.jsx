import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import Notification from './Notification';
import axios from 'axios';

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('debit');
  const [newTransaction, setNewTransaction] = useState({ 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] // Default to today's date
  });

  // Helper: sanitize numeric input (allow digits and one decimal point)
  const sanitizeNumericInput = (val) => {
    if (typeof val !== 'string') val = String(val || '');
    // remove commas and any non digit/dot chars
    let s = val.replace(/,/g, '').replace(/[^0-9.]/g, '');
    // allow only a single dot
    const parts = s.split('.');
    if (parts.length > 2) {
      s = parts[0] + '.' + parts.slice(1).join('');
    }
    return s;
  };
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    actualSetSidebarOpen(false);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA; // Newest first
  });

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get(`/api/customers/${id}/transactions`);
      setCustomer(response.data.customer);

      const sortedTransactions = response.data.transactions.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA; // Newest first
      });
      
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateTransactionForm = () => {
    const newErrors = {};
    const sanitizedAmount = sanitizeNumericInput(newTransaction.amount);

    if (!sanitizedAmount || isNaN(parseFloat(sanitizedAmount)) || parseFloat(sanitizedAmount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!newTransaction.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(newTransaction.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTransactionForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let response;
  const description = newTransaction.description.trim() || 'NONE';
  const amount = parseFloat(sanitizeNumericInput(newTransaction.amount));
      
      if (modalType === 'add') {
        response = await axios.post(`/api/customers/${id}/transactions`, {
          type: transactionType,
          amount: amount,
          description: description,
          date: newTransaction.date
        });

        setTransactions(prev => {
          const newTransactions = [response.data, ...prev];
          return newTransactions.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA; // Newest first
          });
        });
      } else {
        response = await axios.post(`/api/customers/${id}/transactions/${selectedTransaction._id}`, {
          type: transactionType,
          amount: amount,
          description: description,
          date: newTransaction.date
        });

        setTransactions(prev => {
          const updatedTransactions = prev.map(transaction => 
            transaction._id === selectedTransaction._id 
              ? response.data
              : transaction
          );
          return updatedTransactions.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA; // Newest first
          });
        });
      }
      
      setNewTransaction({ 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setSelectedTransaction(null);
      setErrors({});
      setShowModal(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({ submit: error.response?.data?.message || `Failed to ${modalType} transaction` });
    } finally {
      setSubmitting(false);
    }
  };

  const openTransactionModal = (type) => {
    setModalType('add');
    setTransactionType(type);
    setNewTransaction({ 
      amount: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setSelectedTransaction(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditTransactionModal = (transaction) => {
    setModalType('edit');
    setSelectedTransaction(transaction);
    setTransactionType(transaction.type);
    setNewTransaction({ 
      amount: transaction.amount.toString(), 
      description: transaction.description,
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      await axios.delete(`/api/customers/${id}/transactions/${transaction._id}`);
      
      setTransactions(prev => prev.filter(t => t._id !== transaction._id));
      
      setShowActionModal(false);
      setShowConfirmModal(false);
      setSelectedTransaction(null);
      
      showNotification(`${transaction.type === 'debit' ? 'Debit' : 'Credit'} transaction deleted successfully`, 'success');
      
      await fetchCustomerData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showNotification('Failed to delete transaction. Please try again.', 'error');
    }
  };

  const handleDeleteClick = () => {
    setShowActionModal(false);
    setShowConfirmModal(true);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowActionModal(true);
  };

  const handleUpdateClick = () => {
    setShowActionModal(false);
    openEditTransactionModal(selectedTransaction);
  };

  const confirmDelete = () => {
    handleDeleteTransaction(selectedTransaction);
  };

  const calculateBalance = () => {
    let balance = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    });
    return balance;
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout currentPage="/customer">
        <div className="container">
          <div className="loading">Loading customer details...</div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout currentPage="/customer">
        <div className="container">
          <div className="loading">Customer not found</div>
        </div>
      </Layout>
    );
  }

  const balance = calculateBalance();

  return (
    <Layout currentPage="/customer">
      <div className="container" style={{ marginBottom: '4rem' }}>
        <div className="customer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="customer-name">{customer.name}</div>
          <div className="customer-phone">📞 {customer.phone}</div>
          
          {customer.customerId && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '2px solid #3b82f6'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: '600' }}>
                  🔑 Customer Portal Login Credentials
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Customer ID: </span>
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#1e293b',
                    fontFamily: 'monospace'
                  }}>
                    {customer.customerId}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Password: </span>
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#dc2626',
                    fontFamily: 'monospace'
                  }}>
                    {customer.password || '••••••••'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '1.1rem', color: '#718096' }}>Current Balance: </span>
            <span className={`${balance > 0 ? 'balance-positive' : balance < 0 ? 'balance-negative' : ''}`} style={{ fontSize: '1.3rem', fontWeight: '600' }}>
              {formatAmount(Math.abs(balance))}
              {balance > 0 && ' (You will give)'}
              {balance < 0 && ' (You will get)'}
              {balance === 0 && ' (No balance)'}
            </span>
          </div>
        </div>

      <div className="transaction-actions">
          <button 
            onClick={() => openTransactionModal('debit')}
            className="btn btn-danger"
          >
             Add Debit (You Gave)
          </button>
          <button 
            onClick={() => openTransactionModal('credit')}
            className="btn btn-success"
          >
             Add Credit (You Got)
          </button>
        </div>

      <div style={{ 
        padding: '1rem',
        background: '#f7fafc',
        borderRadius: '12px',
        margin: '1rem',
        border: '1px solid #e2e8f0'
      }}>
        <label style={{ 
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#4a5568',
          marginBottom: '0.5rem'
        }}>
          Search Transactions
        </label>
        <input
          type="text"
          placeholder="Search by description or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'white',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Transactions Table */}
      <div className="transactions-table" style={{ paddingBottom: '3rem' }}>
          <h2 style={{ padding: '1.5rem 1.5rem 0', margin: 0, color: '#2d3748' }}>Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
              No transactions found. Add the first transaction to get started!
            </div>
          ) : (
            <>
              {searchTerm && (
                <div style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#718096' }}>
                  {filteredTransactions.length === 0 
                    ? `No transactions found matching "${searchTerm}"` 
                    : `Found ${filteredTransactions.length} transaction(s) matching "${searchTerm}"`
                  }
                </div>
              )}
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchTerm ? filteredTransactions : transactions).map((transaction) => (
                  <tr 
                    key={transaction._id}
                    onClick={() => handleTransactionClick(transaction)}
                    style={{ 
                      cursor: 'pointer'
                    }}
                  >
                    <td>{formatDate(transaction.date || transaction.createdAt)}</td>
                    <td>{transaction.description || 'NONE'}</td>
                    <td className="transaction-debit">
                      {transaction.type === 'debit' ? formatAmount(transaction.amount) : '-'}
                    </td>
                    <td className="transaction-credit">
                      {transaction.type === 'credit' ? formatAmount(transaction.amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Add spacing after transaction table */}
            <div style={{ height: '2rem' }}></div>
            </>
          )}
        </div>

      {/* Add/Edit Transaction Modal */}
      {showModal && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {modalType === 'add' 
                    ? `Add ${transactionType === 'debit' ? 'Debit' : 'Credit'} Transaction`
                    : `Edit ${transactionType === 'debit' ? 'Debit' : 'Credit'} Transaction`
                  }
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowModal(false);
                    setNewTransaction({ 
                      amount: '', 
                      description: '', 
                      date: new Date().toISOString().split('T')[0] 
                    });
                    setSelectedTransaction(null);
                    setErrors({});
                  }}
                >
                  ×
                </button>
              </div>

              {errors.submit && (
                <div className="error-message" style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  backgroundColor: '#fed7d7',
                  color: '#c53030',
                  border: '1px solid #feb2b2'
                }}>
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleTransactionSubmit}>
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={newTransaction.date}
                    onChange={(e) => {
                      setNewTransaction(prev => ({ ...prev, date: e.target.value }));
                      if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                    }}
                    className={`form-input ${errors.date ? 'error' : ''}`}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    {transactionType === 'debit' ? 'You Gave (₹)' : 'You Got (₹)'}
                  </label>
                  <input
                    type="text"
                    id="amount"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={newTransaction.amount}
                    onChange={(e) => {
                      const sanitized = sanitizeNumericInput(e.target.value);
                      setNewTransaction(prev => ({ ...prev, amount: sanitized }));
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                    }}
                    className={`form-input ${errors.amount ? 'error' : ''}`}
                    placeholder={`Enter ${transactionType === 'debit' ? 'debit' : 'credit'} amount`}
                  />
                  {errors.amount && <div className="error-message">{errors.amount}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description (Optional)</label>
                  <textarea
                    id="description"
                    rows="2"
                    value={newTransaction.description}
                    onChange={(e) => {
                      setNewTransaction(prev => ({ ...prev, description: e.target.value }));
                      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    className={`form-input ${errors.description ? 'error' : ''}`}
                    placeholder={`Enter ${transactionType === 'debit' ? 'debit' : 'credit'} description (optional - will show 'NONE' if empty)`}
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                  {errors.description && <div className="error-message">{errors.description}</div>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNewTransaction({ 
                        amount: '', 
                        description: '', 
                        date: new Date().toISOString().split('T')[0] 
                      });
                      setSelectedTransaction(null);
                      setErrors({});
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`btn ${transactionType === 'debit' ? 'btn-danger' : 'btn-success'}`}
                    disabled={submitting}
                  >
                    {submitting 
                      ? (modalType === 'add' ? 'Adding...' : 'Updating...') 
                      : (modalType === 'add' 
                          ? `Add ${transactionType === 'debit' ? 'Debit' : 'Credit'}` 
                          : `Update ${transactionType === 'debit' ? 'Debit' : 'Credit'}`
                        )
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {showActionModal && selectedTransaction && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              maxWidth: '420px',
              width: '100%',
              overflow: 'hidden',
              transform: 'scale(1)',
              transition: 'all 0.3s ease'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '2rem 2rem 1rem 2rem',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: selectedTransaction.type === 'debit' ? '#fee2e2' : '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: selectedTransaction.type === 'debit' ? '#dc2626' : '#16a34a'
                  }}>
                    {selectedTransaction.type === 'debit' ? '−' : '+'}
                  </div>
                  <div>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      Transaction Details
                    </h2>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      Choose an action for this transaction
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedTransaction(null);
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                    e.target.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '2rem' }}>
                {/* Transaction Details Card */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid #e2e8f0'
                }}>
                  {/* Transaction Type Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b'
                    }}>
                      Transaction Type
                    </span>
                    <span style={{
                      backgroundColor: selectedTransaction.type === 'debit' ? '#fef2f2' : '#f0fdf4',
                      color: selectedTransaction.type === 'debit' ? '#dc2626' : '#16a34a',
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: `2px solid ${selectedTransaction.type === 'debit' ? '#fecaca' : '#bbf7d0'}`
                    }}>
                      {selectedTransaction.type === 'debit' ? '📤 Debit' : '📥 Credit'}
                    </span>
                  </div>
                  
                  {/* Amount */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b'
                    }}>
                      Amount
                    </span>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>
                      ₹{selectedTransaction.amount?.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b'
                    }}>
                      Date
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {new Date(selectedTransaction.date || selectedTransaction.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <div style={{ marginTop: '1rem' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Description
                    </span>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      color: '#374151',
                      fontStyle: selectedTransaction.description ? 'normal' : 'italic'
                    }}>
                      {selectedTransaction.description || 'No description provided'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <button 
                    onClick={handleUpdateClick}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>✏️</span>
                    <span>Update</span>
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ef4444';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {showConfirmModal && selectedTransaction && (
          <div className="modal">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Confirm Delete</h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedTransaction(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '1rem 0' }}>
                <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', lineHeight: '1.5' }}>
                  Are you sure you want to delete this{' '}
                  <strong>{selectedTransaction.type === 'debit' ? 'debit' : 'credit'}</strong>{' '}
                  transaction of{' '}
                  <strong>₹{selectedTransaction.amount?.toLocaleString()}</strong>?
                </p>
                <p style={{ margin: '0 0 1.5rem 0', color: '#718096', fontSize: '0.9rem' }}>
                  This action cannot be undone.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedTransaction(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
    </div>
    </Layout>
  );
}

export default CustomerDetail;