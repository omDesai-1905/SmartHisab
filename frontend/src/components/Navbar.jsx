import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {onToggleSidebar && (
              <button 
                className="sidebar-toggle"
                onClick={onToggleSidebar}
              >
                ☰
              </button>
            )}
            <div className="navbar-brand" style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: '#2563eb',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px'
            }}>
              SmartHisab
            </div>
          </div>
          
          <div className="navbar-user">
            <span>Welcome, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;