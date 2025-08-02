import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Dashboard({ sidebarOpen: propSidebarOpen, setSidebarOpen: propSetSidebarOpen }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // For custom notifications
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Confirmation modal
  const [customerToDelete, setCustomerToDelete] = useState(null); // Customer to delete
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar state 
  const [searchTerm, setSearchTerm] = useState(''); // Search functionality
  
  // Use props if provided, otherwise use local state
  const actualSidebarOpen = propSidebarOpen !== undefined ? propSidebarOpen : sidebarOpen;
  const actualSetSidebarOpen = propSetSidebarOpen || setSidebarOpen;
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  
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

  // Filter customers
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCustomerForm = () => {
    const newErrors = {};

    if (!newCustomer.name.trim()) {
      newErrors.name = 'Customer name is required';
    } else if (newCustomer.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!newCustomer.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(newCustomer.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCustomerForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let response;
      if (modalType === 'add') {
        response = await axios.post('/api/customers', {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim()
        });

        setCustomers(prev => [...prev, { ...response.data, balance: 0 }]);
      } else {
        response = await axios.put(`/api/customers/${selectedCustomer._id}`, {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim()
        });
        
        // Update customer in the list
        setCustomers(prev => prev.map(customer => 
          customer._id === selectedCustomer._id 
            ? { ...customer, ...response.data }
            : customer
        ));
      }
      
      // Reset form and close modal
      setNewCustomer({ name: '', phone: '' });
      setSelectedCustomer(null);
      setErrors({});
      setShowModal(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      setErrors({ submit: error.response?.data?.message || `Failed to ${modalType} customer` });
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setModalType('add');
    setNewCustomer({ name: '', phone: '' });
    setSelectedCustomer(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (customer, e) => {
    e.stopPropagation(); 
    setModalType('edit');
    setSelectedCustomer(customer);
    setNewCustomer({ name: customer.name, phone: customer.phone });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customer, e) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
    setShowConfirmModal(true);
  };

  const confirmDeleteCustomer = async () => {
    try {
      await axios.delete(`/api/customers/${customerToDelete._id}`);
      
      // Remove customer from the list
      setCustomers(prev => prev.filter(c => c._id !== customerToDelete._id));
      
      // Close modal
      setShowConfirmModal(false);
      setCustomerToDelete(null);
      
      //success notification
      showNotification(`Customer "${customerToDelete.name}" deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showNotification('Failed to delete customer. Please try again.', 'error');
    }
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/customer/${customerId}`);
  };

  const formatBalance = (balance) => {
    const absBalance = Math.abs(balance);
    return `₹${absBalance.toLocaleString()}`;
  };

  const getBalanceClass = (balance) => {
    if (balance > 0) return 'balance-positive';
    if (balance < 0) return 'balance-negative';
    return '';
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return 'You will give';
    if (balance < 0) return 'You will get';
    return 'No balance';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Sidebar */}
      <div className={`sidebar ${actualSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3 style={{ 
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 'bold',
            color: '#2563eb',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            letterSpacing: '0.5px',
            margin: 0
          }}>SmartHisab</h3>
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
            <label className="sidebar-label">Search Customers</label>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sidebar-search"
            />
          </div>

          {/* Navigation Items */}
          <div className="sidebar-nav">
            <button 
              className="sidebar-nav-item active"
              onClick={() => {
                navigate('/dashboard');
                actualSetSidebarOpen(false);
              }}
            >
              🏠 Dashboard
            </button>
            
            <button 
              className="sidebar-nav-item"
              onClick={() => {
                navigate('/analytics');
                actualSetSidebarOpen(false);
              }}
            >
              📊 Analytics
            </button>
            
            <button 
              className="sidebar-nav-item"
              onClick={handleProfile}
            >
              👤 Profile
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

      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Customer List</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => navigate('/analytics')}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s ease'
              }}
            >
              📊 View Analytics
            </button>
            <button 
              onClick={openAddModal}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              + Add New Customer
            </button>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="customers-table">
            <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
              No customers found. Add your first customer to get started!
            </div>
          </div>
        ) : (
          <div className="customers-table">
            {searchTerm && (
              <div style={{ padding: '1rem', fontSize: '0.9rem', color: '#718096' }}>
                {filteredCustomers.length === 0 
                  ? `No customers found matching "${searchTerm}"` 
                  : `Found ${filteredCustomers.length} customer(s) matching "${searchTerm}"`
                }
              </div>
            )}
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(searchTerm ? filteredCustomers : customers).map((customer) => (
                  <tr 
                    key={customer._id} 
                    onClick={() => handleCustomerClick(customer._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: '600' }}>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td className={getBalanceClass(customer.balance)}>
                      {formatBalance(customer.balance)}
                    </td>
                    <td className={getBalanceClass(customer.balance)}>
                      {getBalanceText(customer.balance)}
                    </td>
                    <td style={{ width: '120px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => openEditModal(customer, e)}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeleteCustomer(customer, e)}
                          className="btn btn-sm btn-danger"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Customer Modal */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {modalType === 'add' ? 'Add New Customer' : 'Edit Customer'}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowModal(false);
                    setNewCustomer({ name: '', phone: '' });
                    setSelectedCustomer(null);
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

              <form onSubmit={handleCustomerSubmit}>
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">Customer Name</label>
                  <input
                    type="text"
                    id="customerName"
                    value={newCustomer.name}
                    onChange={(e) => {
                      setNewCustomer(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="customerPhone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={newCustomer.phone}
                    onChange={(e) => {
                      setNewCustomer(prev => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <div className="error-message">{errors.phone}</div>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNewCustomer({ name: '', phone: '' });
                      setSelectedCustomer(null);
                      setErrors({});
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (modalType === 'add' ? 'Adding...' : 'Updating...') : (modalType === 'add' ? 'Add Customer' : 'Update Customer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && customerToDelete && (
          <div className="modal">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Confirm Delete</h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setCustomerToDelete(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '1rem 0' }}>
                <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', lineHeight: '1.5' }}>
                  Are you sure you want to delete customer{' '}
                  <strong>"{customerToDelete.name}"</strong>?
                </p>
                <p style={{ margin: '0 0 1.5rem 0', color: '#718096', fontSize: '0.9rem' }}>
                  This will also delete all transactions for this customer. This action cannot be undone.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => {
                      setShowConfirmModal(false);
                      setCustomerToDelete(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteCustomer}
                    className="btn btn-danger"
                  >
                    Delete Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;