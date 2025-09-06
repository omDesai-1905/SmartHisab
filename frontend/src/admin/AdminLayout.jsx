import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/users', label: 'All Users' },
    { path: '/admin/messages', label: 'User Messages' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      {/* Navbar */}
      <header className="admin-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="admin-title">SmartHisab Admin</h1>
          </div>
          <div className="navbar-right">
            <span className="admin-email">smarthisab@admin.com</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <h2>Navigation</h2>
            <button 
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="admin-main">
          {children}
        </main>
      </div>

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background-color: #f7fafc;
          position: relative;
        }

        /* Navbar Styles */
        .admin-navbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 60px;
        }

        .navbar-content {
          max-width: 100%;
          height: 100%;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .sidebar-toggle:hover {
          background-color: #f7fafc;
        }

        .admin-title {
          color: #2d3748;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .admin-email {
          color: #4a5568;
          font-size: 14px;
          display: none;
        }

        .logout-btn {
          background: #e53e3e;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .logout-btn:hover {
          background: #c53030;
        }

        /* Container */
        .admin-container {
          position: relative;
          margin-top: 60px;
          min-height: calc(100vh - 60px);
        }

        /* Sidebar Styles */
        .admin-sidebar {
          width: 250px;
          background: white;
          border-right: 1px solid #e2e8f0;
          position: fixed;
          top: 60px;
          left: -250px;
          height: calc(100vh - 60px);
          overflow-y: auto;
          transition: left 0.3s ease;
          z-index: 999;
        }

        .admin-sidebar.sidebar-open {
          left: 0;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h2 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .sidebar-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #a0aec0;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-close:hover {
          color: #718096;
        }

        .sidebar-nav {
          padding: 20px 0;
        }

        .nav-item {
          width: 100%;
          padding: 12px 20px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 16px;
          color: #4a5568;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          background-color: #f7fafc;
          color: #2d3748;
        }

        .nav-item.active {
          background-color: #ebf8ff;
          color: #667eea;
          border-left-color: #667eea;
          font-weight: 500;
        }

        .sidebar-overlay {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        /* Main Content */
        .admin-main {
          padding: 30px;
          min-height: calc(100vh - 60px);
          margin-left: 0;
          transition: margin-left 0.3s ease;
          background-color: #f7fafc;
        }

        /* Desktop Styles */
        @media (min-width: 1024px) {
          .sidebar-toggle {
            display: none;
          }

          .admin-email {
            display: block;
          }

          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 60px;
            height: calc(100vh - 60px);
          }

          .sidebar-header {
            display: none;
          }

          .sidebar-overlay {
            display: none;
          }

          .admin-main {
            margin-left: 250px;
            padding: 30px;
          }
        }

        /* Tablet Styles */
        @media (max-width: 768px) {
          .navbar-content {
            padding: 0 15px;
          }

          .admin-title {
            font-size: 18px;
          }

          .admin-email {
            display: none;
          }

          .logout-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .admin-sidebar {
            width: 280px;
            left: -280px;
          }

          .admin-main {
            padding: 15px;
          }
        }

        /* Mobile Styles */
        @media (max-width: 480px) {
          .navbar-content {
            padding: 0 10px;
          }

          .admin-title {
            font-size: 16px;
          }

          .logout-btn {
            padding: 4px 8px;
            font-size: 11px;
          }

          .admin-sidebar {
            width: 100%;
            left: -100%;
          }

          .admin-main {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
