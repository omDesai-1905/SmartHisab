import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ isOpen, onClose, currentPage = '' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/cashbook', label: 'Cashbook', icon: '📖' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`sidebar-nav-item ${currentPage === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon} {item.label}
              </button>
            ))}
            
            <button className="sidebar-nav-item logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>

          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
    </>
  );
}

export default Sidebar;
