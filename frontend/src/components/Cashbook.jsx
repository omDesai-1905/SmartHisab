import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Notification from './Notification';
import axios from 'axios';

function Cashbook() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState('income');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  // Multiple delete state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  // Helper to sanitize numeric amount input (allow digits and one decimal point)
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cashbook');
      setEntries(response.data || []);
    } catch (error) {
      console.error('Error fetching cashbook entries:', error);
      showNotification('Error fetching entries', 'error');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateEntry = () => {
    const newErrors = {};
    const sanitized = sanitizeNumericInput(newEntry.amount);

    if (!sanitized || isNaN(parseFloat(sanitized)) || parseFloat(sanitized) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    // Description is now optional - no validation required
    
    if (!newEntry.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEntry()) return;
    
    setSubmitting(true);
    try {
      const entryData = {
        ...newEntry,
        description: newEntry.description.trim() || 'NONE',
        type: entryType,
        amount: parseFloat(sanitizeNumericInput(newEntry.amount))
      };

      if (editingEntry) {
        const response = await axios.post(`/api/cashbook/${editingEntry._id || editingEntry.id}`, entryData);
        setEntries(prev => prev.map(entry => 
          (entry._id || entry.id) === (editingEntry._id || editingEntry.id) ? response.data : entry
        ));
        showNotification(`${entryType === 'income' ? 'Income' : 'Expense'} entry updated successfully!`);
      } else {
        const response = await axios.post('/api/cashbook', entryData);
        setEntries(prev => [response.data, ...prev]);
        showNotification(`${entryType === 'income' ? 'Income' : 'Expense'} entry added successfully!`);
      }
      
      setShowModal(false);
      setEditingEntry(null);
      setNewEntry({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    } catch (error) {
      console.error('Error saving entry:', error);
      showNotification('Error saving entry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEntryType(entry.type);
    setNewEntry({
      amount: entry.amount.toString(),
      description: entry.description,
      date: entry.date.split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = (entry) => {
    setEntryToDelete(entry);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      await axios.delete(`/api/cashbook/${entryToDelete._id || entryToDelete.id}`);
      setEntries(prev => prev.filter(entry => (entry._id || entry.id) !== (entryToDelete._id || entryToDelete.id)));
      showNotification('Entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting entry:', error);
      showNotification('Error deleting entry', 'error');
    } finally {
      setShowConfirmDelete(false);
      setEntryToDelete(null);
    }
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedEntries([]);
  };

  // Toggle entry selection
  const toggleEntrySelection = (entryId) => {
    setSelectedEntries((prev) => {
      if (prev.includes(entryId)) {
        return prev.filter((id) => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };

  // Select all entries
  const selectAllEntries = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map((entry) => entry._id || entry.id));
    }
  };

  // Delete multiple entries
  const handleDeleteSelected = async () => {
    if (selectedEntries.length === 0) {
      showNotification('Please select entries to delete', 'error');
      return;
    }

    const count = selectedEntries.length;
    if (!window.confirm(`Are you sure you want to delete ${count} entry/entries?`)) {
      return;
    }

    setDeletingMultiple(true);
    try {
      await axios.post('/api/cashbook/delete-multiple', {
        entryIds: selectedEntries,
      });

      // Remove deleted entries from UI
      setEntries((prev) => prev.filter((entry) => !selectedEntries.includes(entry._id || entry.id)));
      setSelectedEntries([]);
      setSelectionMode(false);
      
      showNotification(`${count} entry/entries deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting entries:', error);
      showNotification('Failed to delete entries. Please try again.', 'error');
    } finally {
      setDeletingMultiple(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date range filter logic
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const entryDate = new Date(entry.date);
      
      if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        matchesDateRange = entryDate >= fromDate && entryDate <= toDate;
      } else if (dateFrom) {
        const fromDate = new Date(dateFrom);
        matchesDateRange = entryDate >= fromDate;
      } else if (dateTo) {
        const toDate = new Date(dateTo);
        matchesDateRange = entryDate <= toDate;
      }
    }
    
    return matchesSearch && matchesDateRange;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate totals based on filtered entries (date range)
  const dateFilteredEntries = entries.filter(entry => {
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const entryDate = new Date(entry.date);
      
      if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        matchesDateRange = entryDate >= fromDate && entryDate <= toDate;
      } else if (dateFrom) {
        const fromDate = new Date(dateFrom);
        matchesDateRange = entryDate >= fromDate;
      } else if (dateTo) {
        const toDate = new Date(dateTo);
        matchesDateRange = entryDate <= toDate;
      }
    }
    return matchesDateRange;
  });

  const totalIncome = dateFilteredEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = dateFilteredEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <Layout currentPage="/cashbook">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cashbook</h1>
          <p className="text-gray-600">Track your income and expenses</p>
        </div>

        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 min-w-[280px] bg-green-100 border-2 border-green-500 rounded-2xl p-6 shadow-lg hover:shadow-xl">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {formatAmount(totalIncome)}
            </div>
            <div className="text-base font-medium text-gray-600">
              Total Income
            </div>
          </div>

          <div className="flex-1 min-w-[280px] bg-red-100 border-2 border-red-500 rounded-2xl p-6 shadow-lg hover:shadow-xl">
            <div className="text-3xl font-bold text-red-500 mb-1">
              {formatAmount(totalExpense)}
            </div>
            <div className="text-base font-medium text-gray-600">
              Total Expense
            </div>
          </div>

          <div className={`flex-1 min-w-[280px] border-2 ${balance >= 0 ? 'border-blue-500 bg-sky-100' : 'border-amber-500 bg-amber-100'} rounded-2xl p-6 shadow-lg hover:shadow-xl`}>
            <div className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-500' : 'text-amber-500'} mb-1`}>
              {formatAmount(Math.abs(balance))}
            </div>
            <div className="text-base font-medium text-gray-600">
              Net Balance {balance >= 0 ? '(Profit)' : '(Loss)'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 justify-center"
            onClick={() => {
              setEntryType('income');
              setShowModal(true);
            }}
          >
            ➕ Add Income
          </button>
          <button
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 justify-center"
            onClick={() => {
              setEntryType('expense');
              setShowModal(true);
            }}
          >
            ➖ Add Expense
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Description:</label>
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Date:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To Date:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Clear Dates
              </button>
            </div>
          </div>
        </div>

        {/* Selection Mode Controls */}
        {filteredEntries.length > 0 && (
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
                    onClick={selectAllEntries}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedEntries.length === filteredEntries.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedEntries.length} selected
                  </span>
                </>
              )}
            </div>

            {selectionMode && (
              <button
                onClick={handleDeleteSelected}
                disabled={selectedEntries.length === 0 || deletingMultiple}
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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">{loading ? (
            <div className="p-8 text-center text-gray-600">Loading entries...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No entries found</h3>
              <p className="text-gray-600">Start by adding your first income or expense entry</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {selectionMode && (
                      <th className="bg-gray-50 px-4 py-3 text-left border-b-2 border-gray-200 w-12">
                        <input
                          type="checkbox"
                          checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                          onChange={selectAllEntries}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </th>
                    )}
                    <th className="bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200 w-1/5">Date</th>
                    <th className="bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200 w-2/5">Description</th>
                    <th className="bg-gray-50 px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-200 w-1/5">Income</th>
                    <th className="bg-gray-50 px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-200 w-1/5">Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr
                      key={entry._id || entry.id}
                      onClick={(e) => {
                        if (selectionMode) {
                          e.stopPropagation();
                          toggleEntrySelection(entry._id || entry.id);
                        } else {
                          setSelectedEntry(entry);
                          setShowDetailModal(true);
                        }
                      }}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${
                        selectionMode && selectedEntries.includes(entry._id || entry.id)
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {selectionMode && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedEntries.includes(entry._id || entry.id)}
                            onChange={() => toggleEntrySelection(entry._id || entry.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.description}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                        {entry.type === 'income' ? formatAmount(entry.amount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">
                        {entry.type === 'expense' ? formatAmount(entry.amount) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingEntry ? 'Edit' : 'Add'} {entryType === 'income' ? 'Income' : 'Expense'} Entry
                </h2>
                <button
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEntry(null);
                    setNewEntry({
                      amount: '',
                      description: '',
                      date: new Date().toISOString().split('T')[0]
                    });
                    setErrors({});
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => {
                      setNewEntry(prev => ({ ...prev, date: e.target.value }));
                      if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                    }}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <div className="text-red-600 text-sm mt-1">{errors.date}</div>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={newEntry.amount}
                    onChange={(e) => {
                      const sanitized = sanitizeNumericInput(e.target.value);
                      setNewEntry(prev => ({ ...prev, amount: sanitized }));
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                    }}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.amount && <div className="text-red-600 text-sm mt-1">{errors.amount}</div>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter description (optional)..."
                    value={newEntry.description}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2 font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                      entryType === 'income' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {submitting ? (editingEntry ? 'Updating...' : 'Adding...') :
                     `${editingEntry ? 'Update' : 'Add'} ${entryType === 'income' ? 'Income' : 'Expense'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmDelete && entryToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={() => setShowConfirmDelete(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Delete Entry</h2>
                <button
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setEntryToDelete(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">Are you sure you want to delete this entry?</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><strong className="text-gray-700">Type:</strong> <span className="text-gray-900">{entryToDelete.type === 'income' ? 'Income' : 'Expense'}</span></p>
                  <p className="mb-2"><strong className="text-gray-700">Amount:</strong> <span className="text-gray-900">{formatAmount(entryToDelete.amount)}</span></p>
                  <p><strong className="text-gray-700">Description:</strong> <span className="text-gray-900">{entryToDelete.description}</span></p>
                </div>
              </div>

              <div className="flex gap-4 justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setEntryToDelete(null);
                  }}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && selectedEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Entry Details</h2>
                <button
                  className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Type</div>
                  <div className={`text-lg font-bold ${selectedEntry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedEntry.type === 'income' ? 'Income' : 'Expense'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Amount</div>
                  <div className={`text-2xl font-bold ${selectedEntry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(selectedEntry.amount)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Description</div>
                  <div className="text-lg text-gray-800">{selectedEntry.description}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-600 mb-1">Date</div>
                  <div className="text-lg text-gray-800">{formatDate(selectedEntry.date)}</div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEdit(selectedEntry);
                    }}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-dark font-medium rounded-lg transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDelete(selectedEntry);
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

        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      </div>
    </Layout>
  );
}

export default Cashbook;