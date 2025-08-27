import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    businessName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        businessName: user.businessName || ''
      });
    }
  }, [user]);

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

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors['name'] = 'Name must be at least 2 characters';
    }

    // Validate mobile number (optional but if provided should be valid)
    if (formData.mobileNumber && formData.mobileNumber.trim()) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobileNumber.trim())) {
        newErrors['mobileNumber'] = 'Please enter a valid 10-digit mobile number';
      }
    }

    // Validate business name (optional but if provided should be valid)
    if (formData.businessName && formData.businessName.trim().length < 2) {
      newErrors['businessName'] = 'Business name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        businessName: formData.businessName.trim()
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update user context
      updateUser(response.data.user);
      
      showNotification('Profile updated successfully!', 'success');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobileNumber: user.mobileNumber || '',
      businessName: user.businessName || ''
    });
    setErrors({});
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete('/api/delete-account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear all local storage and logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      logout();
      
      setNotification({
        type: 'success',
        message: 'Account deleted successfully'
      });

      // Redirect to signup page after a short delay
      setTimeout(() => {
        navigate('/signup');
      }, 2000);

    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete account'
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(true);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <div className="container">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <button 
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className="sidebar-content">
            {/* Navigation Items */}
            <div className="sidebar-nav">
              <button 
                className="sidebar-nav-item"
                onClick={() => {
                  navigate('/dashboard');
                  setSidebarOpen(false);
                }}
              >
                🏠 Dashboard
              </button>
              
              <button 
                className="sidebar-nav-item"
                onClick={() => {
                  navigate('/analytics');
                  setSidebarOpen(false);
                }}
              >
                📊 Analytics
              </button>
              
              <button 
                className="sidebar-nav-item"
                onClick={() => {
                  navigate('/cashbook');
                  setSidebarOpen(false);
                }}
              >
                📖 Cashbook
              </button>
              
              <button 
                className="sidebar-nav-item active"
                onClick={() => setSidebarOpen(false)}
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
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: '#667eea',
                  borderRadius: '50%',
                  margin: '0 auto 0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'white'
                }}>
                  {user?.name?.charAt(0).toUpperCase() || '👤'}
                </div>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#4a5568' }}>{user?.name}</p>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Notification Toast */}
        {notification && (
          <div 
            className={`notification ${notification && notification['type']}`}
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
              backgroundColor: notification && notification['type'] === 'success' ? '#48bb78' : notification && notification['type'] === 'error' ? '#f56565' : '#4299e1',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <span>{notification && notification['message']}</span>
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

        <div className="profile-container">
          <div className="profile-header">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                background: '#667eea',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}>
                {user.name?.charAt(0).toUpperCase() || '👤'}
              </div>
              <h1 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>My Profile</h1>
              <p style={{ color: '#718096', margin: 0 }}>Manage your account information</p>
            </div>
          </div>

          {/* Main Content Layout - Profile Left, Contact Right */}
          <div className="profile-main-layout">
            {/* Profile Card - Left Side */}
            <div className="profile-card">
            {!isEditing ? (
            <div className="profile-view">
              <div className="profile-info profile-info-two-column">
                <div className="info-column">
                  <div className="info-item">
                    <label>👤 Full Name</label>
                    <p>{user.name}</p>
                  </div>
                  
                  <div className="info-item">
                    <label>� Mobile Number</label>
                    <p>{user.mobileNumber || 'Not provided'}</p>
                  </div>
                  
                  <div className="info-item">
                    <label>� Member Since</label>
                    <p>{new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                
                <div className="info-column">
                  <div className="info-item">
                    <label>📧 Email Address</label>
                    <p>{user.email}</p>
                  </div>
                  
                  <div className="info-item">
                    <label>🏢 Business Name</label>
                    <p>{user.businessName || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  style={{ marginRight: '1rem' }}
                >
                  update Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ marginRight: '1rem' }}
                >
                  🚪 Logout
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="btn btn-danger"
                  style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-edit">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">👤 Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors['name'] ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors['name'] && <div className="error-message">{errors['name']}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">📧 Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="form-input readonly"
                    placeholder="Email address"
                    readOnly
                  />
                  <small className="form-hint">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="mobileNumber" className="form-label">📱 Mobile Number</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className={`form-input ${errors['mobileNumber'] ? 'error' : ''}`}
                    placeholder="Enter your 10-digit mobile number"
                    maxLength="10"
                  />
                  {errors['mobileNumber'] && <div className="error-message">{errors['mobileNumber']}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="businessName" className="form-label">🏢 Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={`form-input ${errors['businessName'] ? 'error' : ''}`}
                    placeholder="Enter your business name (optional)"
                  />
                  {errors['businessName'] && <div className="error-message">{errors['businessName']}</div>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          </div>

          {/* Contact Us Section - Right Side */}
          <div className="contact-section">
            <div className="contact-card">
              <div className="contact-header">
                <h2 style={{ 
                  color: '#2d3748', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                   Contact Us
                </h2>
                <p style={{ color: '#718096', margin: 0 }}>
                  We're here to help! Reach out for any complaints, suggestions, or general inquiries.
                </p>
              </div>
              
              <div className="contact-content">
                <div className="contact-item">
                  <div className="contact-details">
                    <h4>Email Support</h4>
                    <p>For complaints, suggestions, and general support:</p>
                    <a 
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=Support Request from SmartHisab User`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-email"
                    >
                      Send Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Delete Account</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to delete your account? This will permanently delete all your data including customers, transactions, and cashbook entries. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;