import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors['name'] = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors['name'] = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors['email'] = 'Email is invalid';
    }

    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      newErrors['mobileNumber'] = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors['mobileNumber'] = 'Mobile number must be 10 digits';
    }

    // Password validation
    if (!formData.password) {
      newErrors['password'] = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors['password'] = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors['confirmPassword'] = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors['confirmPassword'] = 'Passwords do not match';
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
    setMessage('');

    const result = await signup({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim()
    });

    setLoading(false);

    if (result.success) {
      setMessage('Account created successfully! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: '#667eea',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
          }}>
            🎉
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us and start managing your finances</p>
        </div>
        
        {message && (
          <div className={`${message.includes('successfully') ? 'success-message' : 'error-message'}`} style={{
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            backgroundColor: message.includes('successfully') ? '#f0fff4' : '#fed7d7',
            color: message.includes('successfully') ? '#22543d' : '#c53030',
            border: `1px solid ${message.includes('successfully') ? '#9ae6b4' : '#feb2b2'}`,
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

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
              onChange={handleChange}
              className={`form-input ${errors['email'] ? 'error' : ''}`}
              placeholder="Enter your email address"
            />
            {errors['email'] && <div className="error-message">{errors['email']}</div>}
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
              maxLength={10}
            />
            {errors['mobileNumber'] && <div className="error-message">{errors['mobileNumber']}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">🔒 Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors['password'] ? 'error' : ''}`}
              placeholder="Enter your password (6+ characters)"
            />
            {errors['password'] && <div className="error-message">{errors['password']}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">🔐 Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors['confirmPassword'] ? 'error' : ''}`}
              placeholder="Confirm your password"
            />
            {errors['confirmPassword'] && <div className="error-message">{errors['confirmPassword']}</div>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Creating Account...
              </span>
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;