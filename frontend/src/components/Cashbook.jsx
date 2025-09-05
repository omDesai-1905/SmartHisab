import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import Notification from './Notification';
import axios from 'axios';

function Cashbook() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState('income');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [newEntry, setNewEntry] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
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
    
    if (!newEntry.amount || parseFloat(newEntry.amount) <= 0) {
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
        amount: parseFloat(newEntry.amount)
      };
      
      if (editingEntry) {
        // Update existing entry
        const response = await axios.post(`/api/cashbook/${editingEntry._id || editingEntry.id}`, entryData);
        setEntries(prev => prev.map(entry => 
          (entry._id || entry.id) === (editingEntry._id || editingEntry.id) ? response.data : entry
        ));
        showNotification(`${entryType === 'income' ? 'Income' : 'Expense'} entry updated successfully!`);
      } else {
        // Add new entry
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

  // Calculate totals
  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <Layout currentPage="/cashbook">
      <div className="cashbook-page">
        <div className="cashbook-container">
          {/* Header with Summary Cards */}
          <div className="cashbook-header">
            <div className="summary-cards">
              {/* Total Income Card */}
              <div className="summary-card income-card">
                <div className="summary-details">
                  <div className="summary-amount">{formatAmount(totalIncome)}</div>
                  <div className="summary-label">Total Income</div>
                </div>
              </div>

              {/* Total Expense Card */}
              <div className="summary-card expense-card">
                <div className="summary-details">
                  <div className="summary-amount">{formatAmount(totalExpense)}</div>
                  <div className="summary-label">Total Expense</div>
                </div>
              </div>

              {/* Balance Card */}
              <div className={`summary-card balance-card ${balance >= 0 ? 'positive' : 'negative'}`}>
                <div className="summary-details">
                  <div className="summary-amount">{formatAmount(Math.abs(balance))}</div>
                  <div className="summary-label">Net Balance</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="btn btn-success"
                onClick={() => {
                  setEntryType('income');
                  setShowModal(true);
                }}
              >
                ➕ Add Income
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  setEntryType('expense');
                  setShowModal(true);
                }}
              >
                ➖ Add Expense
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="search-filter">
              <label>Search Description:</label>
              <input
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="date-range-filter">
              <div className="date-input-group">
                <label>From Date:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="filter-select"
                />
              </div>
              <div className="date-input-group">
                <label>To Date:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="filter-select"
                />
              </div>
              <button 
                className="btn btn-secondary clear-dates"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Clear Dates
              </button>
            </div>
          </div>

          {/* Entries Table */}
          <div className="entries-section">
            {loading ? (
              <div className="loading">Loading entries...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="no-entries">
                <h3>No entries found</h3>
                <p>Start by adding your first income or expense entry</p>
              </div>
            ) : (
              <div className="entries-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Income</th>
                      <th>Expense</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map(entry => (
                      <tr key={entry._id || entry.id} className={entry.type}>
                        <td>{formatDate(entry.date)}</td>
                        <td>{entry.description}</td>
                        <td className="amount income">
                          {entry.type === 'income' ? formatAmount(entry.amount) : '-'}
                        </td>
                        <td className="amount expense">
                          {entry.type === 'expense' ? formatAmount(entry.amount) : '-'}
                        </td>
                        <td className="actions">
                          <button 
                            className="btn btn-edit"
                            onClick={() => handleEdit(entry)}
                            title="Edit"
                          >
                            update
                          </button>
                          <button 
                            className="btn btn-delete"
                            onClick={() => handleDelete(entry)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEntry ? 'Edit' : 'Add'} {entryType === 'income' ? 'Income' : 'Expense'} Entry</h2>
              <button className="modal-close" onClick={() => {
                setShowModal(false);
                setEditingEntry(null);
                setNewEntry({
                  amount: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0]
                });
                setErrors({});
              }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => {
                    setNewEntry(prev => ({ ...prev, date: e.target.value }));
                    if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                  }}
                  className={`form-input ${errors.date ? 'error' : ''}`}
                />
                {errors.date && <div className="error-message">{errors.date}</div>}
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newEntry.amount}
                  onChange={(e) => {
                    setNewEntry(prev => ({ ...prev, amount: e.target.value }));
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  className={`form-input ${errors.amount ? 'error' : ''}`}
                />
                {errors.amount && <div className="error-message">{errors.amount}</div>}
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter description (optional)..."
                  value={newEntry.description}
                  onChange={(e) => {
                    setNewEntry(prev => ({ ...prev, description: e.target.value }));
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  className={`form-input ${errors.description ? 'error' : ''}`}
                />
                {errors.description && <div className="error-message">{errors.description}</div>}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`btn ${entryType === 'income' ? 'btn-success' : 'btn-danger'}`}
                >
                  {submitting ? (editingEntry ? 'Updating...' : 'Adding...') : 
                   `${editingEntry ? 'Update' : 'Add'} ${entryType === 'income' ? 'Income' : 'Expense'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && entryToDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Entry</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowConfirmDelete(false);
                  setEntryToDelete(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this entry?</p>
              <div className="entry-info">
                <p><strong>Type:</strong> {entryToDelete.type === 'income' ? 'Income' : 'Expense'}</p>
                <p><strong>Amount:</strong> ₹{entryToDelete.amount?.toLocaleString()}</p>
                <p><strong>Description:</strong> {entryToDelete.description}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowConfirmDelete(false);
                  setEntryToDelete(null);
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
      )}

      {/* Notification */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
    </Layout>
  );
}

export default Cashbook;