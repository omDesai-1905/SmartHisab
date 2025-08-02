import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function CustomerDetail({ sidebarOpen: propSidebarOpen, setSidebarOpen: propSetSidebarOpen }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use props if provided, otherwise use local state
  const actualSidebarOpen = propSidebarOpen !== undefined ? propSidebarOpen : sidebarOpen;
  const actualSetSidebarOpen = propSetSidebarOpen || setSidebarOpen;

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
      
      // Sort transactions by date
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

    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
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
      
      if (modalType === 'add') {
        response = await axios.post(`/api/customers/${id}/transactions`, {
          type: transactionType,
          amount: parseFloat(newTransaction.amount),
          description: description,
          date: newTransaction.date
        });
        
        // Add new transaction and re sort the list
        setTransactions(prev => {
          const newTransactions = [response.data, ...prev];
          return newTransactions.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA; // Newest first
          });
        });
      } else {
        response = await axios.put(`/api/customers/${id}/transactions/${selectedTransaction._id}`, {
          type: transactionType,
          amount: parseFloat(newTransaction.amount),
          description: description,
          date: newTransaction.date
        });
        
        // Update transaction and re sort the list
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
      <div className="container">
        <div className="loading">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container">
        <div className="loading">Customer not found</div>
      </div>
    );
  }

  const balance = calculateBalance();

  return (
    <div className="container" style={{ marginBottom: '4rem' }}>
      {/* Sidebar */}
      <div className={`sidebar ${actualSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-close"
            onClick={() => actualSetSidebarOpen(false)}
          >
            ×
          </button>
        </div>
        
        <div className="sidebar-content">
          {/* Search Bar */}
          <div className="sidebar-section">
            <label className="sidebar-label">Search Transactions</label>
            <input
              type="text"
              placeholder="Search by description or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sidebar-search"
            />
          </div>

          {/* Navigation Items */}
          <div className="sidebar-nav">
            <button 
              className="sidebar-nav-item"
              onClick={() => {
                navigate('/dashboard');
                actualSetSidebarOpen(false);
              }}
            >
              🏠 Dashboard
            </button>
            
            <button 
              className="sidebar-nav-item active"
              onClick={() => actualSetSidebarOpen(false)}
            >
              👤 Customer Details
            </button>
            
            <button 
              className="sidebar-nav-item"
              onClick={handleProfile}
            >
              ⚙️ Profile
            </button>
            
            <button 
              className="sidebar-nav-item logout"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>

          {/* User Info */}
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {actualSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => actualSetSidebarOpen(false)}
        />
      )}

      {/* Custom Notification Toast */}
      {notification && (
        <div 
          className={`notification ${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '500',
            zIndex: 1000,
            minWidth: '300px',
            backgroundColor: notification.type === 'success' ? '#48bb78' : notification.type === 'error' ? '#f56565' : '#4299e1',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              marginLeft: '1rem',
              opacity: 0.8
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Customer Header */}
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

      {/* Transaction Actions */}
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
                    <th>Type</th>
                    <th>Amount</th>
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
                    <td>
                      <span className={transaction.type === 'debit' ? 'transaction-debit' : 'transaction-credit'}>
                        {transaction.type === 'debit' ? ' Debit' : ' Credit'}
                      </span>
                    </td>
                    <td className={transaction.type === 'debit' ? 'transaction-debit' : 'transaction-credit'}>
                      {transaction.type === 'debit' ? '-' : '+'}{formatAmount(transaction.amount)}
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
                {modalType === 'edit' && (
                  <div className="form-group">
                    <label className="form-label">Transaction Type</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                      className="form-input"
                    >
                      <option value="debit">Debit (You Gave)</option>
                      <option value="credit">Credit (You Got)</option>
                    </select>
                  </div>
                )}

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
                  <label htmlFor="amount" className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => {
                      setNewTransaction(prev => ({ ...prev, amount: e.target.value }));
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                    }}
                    className={`form-input ${errors.amount ? 'error' : ''}`}
                    placeholder="Enter amount"
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
                    placeholder={`Enter ${transactionType} description (optional - will show 'NONE' if empty)`}
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

      {/* Transaction Action Modal */}
      {showActionModal && selectedTransaction && (
          <div className="modal">
            <div className="modal-content" style={{ maxWidth: '300px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Transaction Actions</h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedTransaction(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '1rem 0' }}>
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                    {selectedTransaction.type === 'debit' ? ' Debit' : ' Credit'} Transaction
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>Amount:</strong> ₹{selectedTransaction.amount?.toLocaleString()}
                  </p>
                  <p style={{ margin: '0' }}>
                    <strong>Description:</strong> {selectedTransaction.description || 'NONE'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={handleUpdateClick}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Update
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Confirmation Modal */}
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
    </div>
  );
}

export default CustomerDetail;