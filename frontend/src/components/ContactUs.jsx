import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function ContactUs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    emailAddress: '',
    topic: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        emailAddress: user.email || ''
      }));
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

    // Validate email address
    if (!formData.emailAddress || !formData.emailAddress.trim()) {
      newErrors['emailAddress'] = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailAddress.trim())) {
        newErrors['emailAddress'] = 'Please enter a valid email address';
      }
    }

    // Validate topic
    if (!formData.topic || formData.topic.trim().length < 3) {
      newErrors['topic'] = 'Topic must be at least 3 characters';
    }

    // Validate description
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors['description'] = 'Description must be at least 10 characters';
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
      showNotification('Please fill all required fields correctly', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailAddress: formData.emailAddress.trim(),
          topic: formData.topic.trim(),
          description: formData.description.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Message sent successfully! Admin will review it soon.', 'success');
        
        // Reset form after successful submission
        setFormData({
          emailAddress: user?.email || '',
          topic: '',
          description: ''
        });
      } else {
        showNotification(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Network error occurred. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(true);
  };

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
                className="sidebar-nav-item"
                onClick={() => {
                  navigate('/profile');
                  setSidebarOpen(false);
                }}
              >
                ⚙️ Profile
              </button>
              
              <button 
                className="sidebar-nav-item active"
                onClick={() => setSidebarOpen(false)}
              >
                📞 Contact Us
              </button>
              
              <button 
                className="sidebar-nav-item logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="sidebar-user">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    margin: '0 auto 0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'white',
                    fontWeight: '600',
                    border: '3px solid #f3f4f6'
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <p style={{ margin: '0', fontSize: '0.95rem', color: '#1f2937', fontWeight: '600' }}>{user?.name}</p>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>{user?.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Notification Toast */}
        {notification && (
          <div 
            className={`notification ${notification.type}`}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '600',
              zIndex: 1000,
              minWidth: '320px',
              backgroundColor: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#3b82f6',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideIn 0.3s ease-out',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.4rem',
                cursor: 'pointer',
                marginLeft: '1rem',
                opacity: 0.8,
                fontWeight: 'bold',
                padding: '0.25rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        <div className="contact-us-container">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Contact Us</h1>
            <p className="page-subtitle">We're here to help! Send us your questions, feedback, or suggestions.</p>
          </div>

          <div className="contact-us-content">
            <div className="contact-form-card">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="emailAddress" className="form-label">Your Email Address</label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className={`form-input ${errors.emailAddress ? 'error' : ''}`}
                    placeholder="Enter your email address"
                    required
                  />
                  {errors.emailAddress && <div className="error-message">{errors.emailAddress}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="topic" className="form-label">Topic/Subject</label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className={`form-input ${errors.topic ? 'error' : ''}`}
                    placeholder="Enter the topic or subject of your message"
                    required
                  />
                  {errors.topic && <div className="error-message">{errors.topic}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`form-input ${errors.description ? 'error' : ''}`}
                    placeholder="Describe your question, feedback, suggestion, or issue in detail..."
                    rows="6"
                    required
                    style={{ resize: 'vertical', minHeight: '120px' }}
                  />
                  {errors.description && <div className="error-message">{errors.description}</div>}
                  <small className="form-hint">
                    Please provide as much detail as possible to help us assist you better.
                  </small>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ 
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Send Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-us-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          min-height: calc(100vh - 80px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 1.1rem;
          font-weight: 500;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-us-content {
          display: flex;
          justify-content: center;
          align-items: start;
        }

        .contact-form-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          border: 2px solid #f3f4f6;
          max-width: 700px;
          width: 100%;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-label {
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          padding: 1.25rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 16px;
          font-size: 1.1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #f9fafb;
          color: #2d3748;
          font-weight: 500;
        }

        .form-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          background: #ffffff;
          transform: translateY(-2px);
          color: #111827;
        }

        .form-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .form-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .form-hint {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          font-style: italic;
        }

        .btn {
          padding: 1.25rem 2rem;
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: #667eea;
          color: #ffffff;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .contact-us-container {
            padding: 1rem;
          }
          
          .contact-form-card {
            padding: 2rem 1.5rem;
          }

          .page-title {
            font-size: 2.25rem;
          }

          .page-subtitle {
            font-size: 1rem;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        
      `}</style>
    </>
  );
}

export default ContactUs;
