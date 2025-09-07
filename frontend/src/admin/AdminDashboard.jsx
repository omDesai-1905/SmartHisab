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
        <div className="min-h-1/2-screen flex flex-col items-center justify-center gap-5">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
        <div className="max-w-screen-xl mx-auto">
        <div className="text-xl mb-10">
        <h1 className="text-gray-800 text-3xl font-bold mb-5">Dashboard Overview</h1><br/>
        <p className="text-gray-600 text-base p-10">Welcome to SmartHisab Admin Panel</p><br />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-7 mb-10 md:grid-cols-1">
          <div 
            className="bg-white rounded-[12px] p-[30px] shadow-md border-2 border-[#667eea] cursor-pointer "
            onClick={() => navigate('/admin/users')}
          >
            <div className="card-content h-[130px]">
              <h3 className="text-gray-800 text-lg font-semibold mb-4" style={{ marginLeft: '20px' }}>Total Users</h3>
              <p className="text-gray-900 text-4xl font-bold block mb-4" style={{ marginLeft: '20px' }}>{stats.totalUsers}</p>
              <span className="text-gray-600 text-sm" style={{ marginLeft: '20px' }}>Click to view all users</span>
            </div>
          </div>

          {/* User Messages Card */}
          <div 
            className="bg-white rounded-[12px] p-[30px] shadow-md border-2 border-green-500 cursor-pointer"
            onClick={() => navigate('/admin/messages')}
          >
            <div className="card-content h-[130px]">
              <h3 className="text-gray-800 text-lg font-semibold mb-4" style={{ marginLeft: '20px' }}>User Messages</h3>
              <p className="text-gray-900 text-4xl font-bold block mb-4]" style={{ marginLeft: '20px' }}>{stats.totalMessages}</p>
              <span className="text-gray-600 text-sm" style={{ marginLeft: '20px' }}>Click to view messages</span>
            </div>
          </div>
        </div>
        <br />
        <div className="bg-white rounded-xl p-8 shadow-md h-[170px] w-[950px]" >
          <h2 className="text-gray-800 text-lg font-semibold mb-6" style={{ marginBottom: '20px' }}>Quick Overview</h2>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-5 md:grid-cols-1">
            <div className="flex flex-col p-5 bg-gray-100 rounded-lg text-center h-[90px]">
              <span className="text-gray-600 text-sm mb-2">Total Messages</span>
              <span className="text-gray-800 text-2xl font-semibold">{stats.totalMessages}</span>
            </div>
            <div className="flex flex-col p-5 bg-gray-100 rounded-lg text-center h-[90px]">
              <span className="text-gray-600 text-sm mb-2">Total Users</span>
              <span className="text-gray-900 text-2xl font-semibold">{stats.totalUsers}</span>
            </div>
          </div>
          <br />
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;