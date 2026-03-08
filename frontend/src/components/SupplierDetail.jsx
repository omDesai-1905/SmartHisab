import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Notification from './Notification';
import axios from 'axios';

function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('debit');
  const [newTransaction, setNewTransaction] = useState({ 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0]
  });

  const sanitizeNumericInput = (val) => {
    if (typeof val !== 'string') val = String(val || '');
    let s = val.replace(/,/g, '').replace(/[^0-9.]/g, '');
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  useEffect(() => {
    fetchSupplierData();
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

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTransactions([]);
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(transactionId)) {
        return prev.filter((id) => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const selectAllTransactions = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map((t) => t._id || t.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) {
      showNotification('Please select transactions to delete', 'error');
      return;
    }

    const count = selectedTransactions.length;
    if (!window.confirm(`Are you sure you want to delete ${count} transaction${count > 1 ? 's' : ''}?`)) {
      return;
    }

    setDeletingMultiple(true);
    try {
      await axios.post(`/api/suppliers/${id}/transactions/delete-multiple`, {
        transactionIds: selectedTransactions,
      });
      setTransactions((prev) => prev.filter((t) => !selectedTransactions.includes(t._id || t.id)));
      setSelectedTransactions([]);
      setSelectionMode(false);
      showNotification(`Successfully deleted ${count} transaction${count > 1 ? 's' : ''}`, 'success');
    } catch (error) {
      console.error('Error deleting transactions:', error);
      showNotification(error.response?.data?.message || 'Failed to delete transactions', 'error');
    } finally {
      setDeletingMultiple(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });

  const fetchSupplierData = async () => {
    try {
      const response = await axios.get(`/api/suppliers/${id}/transactions`);
      setSupplier(response.data.supplier);

      const sortedTransactions = response.data.transactions.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA;
      });
      
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      if (error.response?.status === 404) {
        navigate('/suppliers');
      }
      showNotification('Failed to fetch supplier data', 'error');
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
      today.setHours(23, 59, 59, 999);
      
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
        response = await axios.post(`/api/suppliers/${id}/transactions`, {
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
            return dateB - dateA;
          });
        });
        showNotification('Transaction added successfully');
      } else {
        response = await axios.post(`/api/suppliers/${id}/transactions/${selectedTransaction._id}`, {
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
            return dateB - dateA;
          });
        });
        showNotification('Transaction updated successfully');
      }
      
      fetchSupplierData();
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
      showNotification(error.response?.data?.message || 'Failed to save transaction', 'error');
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
    setErrors({});
    setShowModal(true);
  };

  const openEditTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalType('edit');
    setTransactionType(transaction.type);
    setNewTransaction({
      amount: transaction.amount.toString(),
      description: transaction.description === 'NONE' ? '' : transaction.description,
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setErrors({});
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/suppliers/${id}/transactions/${selectedTransaction._id}`);
      setTransactions(prev => prev.filter(t => t._id !== selectedTransaction._id));
      fetchSupplierData();
      showNotification('Transaction deleted successfully');
      setShowConfirmModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showNotification('Failed to delete transaction', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotals = () => {
    const totalDebit = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCredit = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit
    };
  };

  if (loading) {
    return (
      <Layout currentPage="/suppliers">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!supplier) {
    return (
      <Layout currentPage="/suppliers">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Supplier not found</div>
        </div>
      </Layout>
    );
  }

  const { totalDebit, totalCredit, balance } = calculateTotals();

  return (
    <Layout currentPage="/suppliers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/suppliers')}
            className="mb-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            ← Back to Suppliers
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{supplier.name}</h1>
          <p className="text-gray-600">{supplier.phone}</p>
        </div>

        {/* Summary - Compact Mobile-Friendly Layout */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Total Debit */}
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">You Gave</div>
              <div className="text-base sm:text-xl font-bold text-red-600">{formatAmount(totalDebit)}</div>
            </div>

            {/* Total Credit */}
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">You Got</div>
              <div className="text-base sm:text-xl font-bold text-green-600">{formatAmount(totalCredit)}</div>
            </div>

            {/* Net Balance */}
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Balance</div>
              <div className={`text-base sm:text-xl font-bold ${
                balance > 0 ? 'text-red-600' :
                balance < 0 ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {formatAmount(Math.abs(balance))}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {balance > 0 ? 'You Owe' : balance < 0 ? 'They Owe' : 'Settled'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => openTransactionModal('debit')}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Add Debit (You Gave)
          </button>
          <button 
            onClick={() => openTransactionModal('credit')}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Add Credit (You Got)
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Transactions
          </label>
          <input
            type="text"
            placeholder="Search by description or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* Selection Mode Controls */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSelectionMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectionMode
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {selectionMode ? 'Cancel' : 'Select'}
              </button>
              
              {selectionMode && (
                <>
                  <button
                    onClick={selectAllTransactions}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedTransactions.length === filteredTransactions.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedTransactions.length} selected
                  </span>
                </>
              )}
            </div>

            {selectionMode && (
              <button
                onClick={handleDeleteSelected}
                disabled={selectedTransactions.length === 0 || deletingMultiple}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {deletingMultiple ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions yet</h3>
              <p className="text-gray-600">Add your first transaction to get started</p>
            </div>
          ) : (
            <>
              {searchTerm && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 text-sm text-blue-800">
                  {filteredTransactions.length === 0 
                    ? `No transactions found matching "${searchTerm}"` 
                    : `Found ${filteredTransactions.length} transaction(s) matching "${searchTerm}"`
                  }
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      {selectionMode && (
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                            onChange={selectAllTransactions}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Debit</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchTerm ? filteredTransactions : transactions).map((transaction) => (
                      <tr 
                        key={transaction._id}
                        onClick={(e) => {
                          if (selectionMode) {
                            e.stopPropagation();
                            toggleTransactionSelection(transaction._id || transaction.id);
                          } else {
                            setSelectedTransaction(transaction);
                            setShowDetailModal(true);
                          }
                        }}
                        className={`border-b border-gray-100 transition-colors cursor-pointer ${
                          selectionMode && selectedTransactions.includes(transaction._id || transaction.id)
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {selectionMode && (
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(transaction._id || transaction.id)}
                              onChange={() => toggleTransactionSelection(transaction._id || transaction.id)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(transaction.date || transaction.createdAt)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{transaction.description || 'NONE'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-red-600">
                          {transaction.type === 'debit' ? formatAmount(transaction.amount) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {transaction.type === 'credit' ? formatAmount(transaction.amount) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalType === 'add' ? 'Add' : 'Edit'} {transactionType === 'debit' ? 'Debit' : 'Credit'} Transaction
                </h2>
                <button
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    setNewTransaction({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
                    setErrors({});
                    setSelectedTransaction(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleTransactionSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter amount"
                      value={newTransaction.amount}
                      onChange={(e) => {
                        const sanitized = sanitizeNumericInput(e.target.value);
                        setNewTransaction({ ...newTransaction, amount: sanitized });
                        if (errors.amount) setErrors({ ...errors, amount: '' });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-primary/20 outline-none transition-all ${
                        errors.amount ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                      }`}
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter description (optional)"
                      value={newTransaction.description}
                      onChange={(e) => {
                        setNewTransaction({ ...newTransaction, description: e.target.value });
                      }}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => {
                        setNewTransaction({ ...newTransaction, date: e.target.value });
                        if (errors.date) setErrors({ ...errors, date: '' });
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-primary/20 outline-none transition-all ${
                        errors.date ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNewTransaction({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
                      setErrors({});
                      setSelectedTransaction(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : modalType === 'add' ? 'Add Transaction' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
                <button className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors" onClick={() => setShowDetailModal(false)}>
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Type</div>
                  <div className={`text-lg font-bold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'credit' ? 'Credit (You Got)' : 'Debit (You Gave)'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Amount</div>
                  <div className={`text-2xl font-bold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(selectedTransaction.amount)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Description</div>
                  <div className="text-lg text-gray-800">{selectedTransaction.description || 'NONE'}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Date</div>
                  <div className="text-lg text-gray-800">{formatDate(selectedTransaction.date || selectedTransaction.createdAt)}</div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditTransactionModal(selectedTransaction);
                    }}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowConfirmModal(true);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Transaction</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
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

export default SupplierDetail;
