import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        {/* <div className="loading-container"> */}
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-5">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome to SmartHisab Admin Panel</p>
        </div>

        {/* Dashboard Cards */}
        <div className="dashboard-grid">
          {/* Total Users Card */}
          <div 
            className="dashboard-card users-card"
            onClick={() => navigate('/admin/users')}
          >
            <div className="card-content">
              <h3>Total Users</h3>
              <p className="card-number">{stats.totalUsers}</p>
              <span className="card-action">Click to view all users</span>
            </div>
          </div>

          {/* User Messages Card */}
          <div 
            className="dashboard-card messages-card"
            onClick={() => navigate('/admin/messages')}
          >
            <div className="card-content">
              <h3>User Messages</h3>
              <p className="card-number">{stats.totalMessages}</p>
              <span className="card-action">Click to view messages</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <h2>Quick Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Messages</span>
              <span className="stat-value">{stats.totalMessages}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.totalUsers}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          min-height: 50vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-header h1 {
          color: #2d3748;
          font-size: 32px;
          font-weight: 600;
          margin: 0 0 10px 0;
        }

        .page-header p {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .dashboard-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .users-card {
          border-left: 4px solid #667eea;
        }

        .users-card:hover {
          border-color: #667eea;
        }

        .messages-card {
          border-left: 4px solid #48bb78;
        }

        .messages-card:hover {
          border-color: #48bb78;
        }

        .card-content h3 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 15px 0;
        }

        .card-number {
          color: #1a202c;
          font-size: 36px;
          font-weight: 700;
          display: block;
          margin-bottom: 15px;
        }

        .card-action {
          color: #718096;
          font-size: 14px;
        }

        .unread-badge {
          background: #e53e3e;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 10px;
        }

        .quick-stats {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        .quick-stats h2 {
          color: #2d3748;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 25px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          text-align: center;
        }

        .stat-label {
          color: #718096;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .stat-value {
          color: #2d3748;
          font-size: 24px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .page-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminDashboard;
