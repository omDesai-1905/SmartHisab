import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await adminLogin(formData.email, formData.password);
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Admin Login</h2>
          <p>Access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter admin email"
              disabled={isLoading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter password"
              disabled={isLoading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button 
              onClick={() => navigate('/login')}
              className="link-button"
            >
              Back to User Login
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .auth-form {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-header h2 {
          color: #333;
          margin-bottom: 10px;
          font-size: 28px;
          font-weight: 600;
        }

        .auth-header p {
          color: #666;
          font-size: 14px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input.error {
          border-color: #e53e3e;
        }

        .error-text {
          color: #e53e3e;
          font-size: 12px;
          margin-top: 5px;
        }

        .error-message {
          background-color: #fed7d7;
          color: #c53030;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          text-align: center;
          margin-top: 30px;
        }

        .link-button {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          text-decoration: underline;
          font-size: 14px;
        }

        .link-button:hover {
          color: #764ba2;
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;
