import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Analytics() {
  const [customers, setCustomers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalCustomers: 0,
    totalDebitAmount: 0,
    totalCreditAmount: 0,
    netBalance: 0,
    transactions: 0
  });
  const [cashbookData, setCashbookData] = useState({
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlyNet: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchCustomers();
    fetchAnalyticsData();
    fetchCashbookData();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get('/api/customers/analytics');
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashbookData = async () => {
    try {
      const response = await axios.get('/api/cashbook');
      const entries = response.data;
      
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Filter entries for current month
      const currentMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      });
      
      // Calculate monthly totals
      const monthlyIncome = currentMonthEntries
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
        
      const monthlyExpense = currentMonthEntries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
        
      const monthlyNet = monthlyIncome - monthlyExpense;
      
      setCashbookData({
        monthlyIncome,
        monthlyExpense,
        monthlyNet
      });
    } catch (error) {
      console.error('Error fetching cashbook data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setSidebarOpen(false);
  };

  // Get top customers by balance (positive and negative)
  const getTopCustomers = () => {
    const sortedByHighest = [...customers]
      .filter(c => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
    
    const sortedByLowest = [...customers]
      .filter(c => c.balance < 0)
      .sort((a, b) => a.balance - b.balance)
      .slice(0, 5);

    return { highest: sortedByHighest, lowest: sortedByLowest };
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  const topCustomers = getTopCustomers();

  return (
    <div className="container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
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
              className="sidebar-nav-item active"
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
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="dashboard">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="sidebar-toggle"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '4px',
                color: '#4a5568'
              }}
            >
              ☰
            </button>
            <h1 className="dashboard-title">📊 Business Analytics</h1>
          </div>
        </div>

        {analyticsData.totalCustomers === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#718096',
            fontSize: '1.1rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h2>No Data Available</h2>
            <p>Add customers and transactions to view analytics</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Analytics Dashboard - Single Line Layout */}
            <div 
              className="analytics-dashboard"
              style={{ 
                background: 'linear-gradient(135deg,rgba(0, 0, 55, 1), rgba(140, 140, 120, 0.8) )',
                borderRadius: '16px',
                padding: '2.5rem',
                marginBottom: '2rem',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h2 
                className="analytics-title"
                style={{ 
                  margin: '0 0 3rem 0', 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  textAlign: 'center',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                📊 Business Analytics Dashboard
              </h2>
              
              {/* Single Line Grid Layout */}
              <div 
                className="analytics-grid"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '1.5rem',
                  width: '100%',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}
              >
                {/* Card 1 - Total Number of Customers */}
                <div 
                  className="analytics-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div className="analytics-card-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                  <div className="analytics-card-value" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {analyticsData.totalCustomers}
                  </div>
                  <div className="analytics-card-label" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Total Customers
                  </div>
                </div>

                {/* Card 2 - Total Debit Amount */}
                <div 
                  className="analytics-card"
                  style={{
                    background: 'rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                    cursor: 'pointer',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div className="analytics-card-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📉</div>
                  <div className="analytics-card-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{analyticsData.totalDebitAmount.toLocaleString()}
                  </div>
                  <div className="analytics-card-label" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Total Debit
                  </div>
                  <div className="analytics-card-description" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                    (Paid Out)
                  </div>
                </div>

                {/* Card 3 - Total Credit Amount */}
                <div 
                  className="analytics-card"
                  style={{
                    background: 'rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(34, 197, 94, 0.5)',
                    cursor: 'pointer',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div className="analytics-card-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💰</div>
                  <div className="analytics-card-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{analyticsData.totalCreditAmount.toLocaleString()}
                  </div>
                  <div className="analytics-card-label" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Total Credit
                  </div>
                  <div className="analytics-card-description" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                    (Received)
                  </div>
                </div>

                {/* Card 4 - Net Balance */}
                <div 
                  className="analytics-card"
                  style={{
                    background: analyticsData.netBalance >= 0 
                      ? 'rgba(34, 197, 94, 0.3)' 
                      : 'rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    border: analyticsData.netBalance >= 0 
                      ? '2px solid rgba(34, 197, 94, 0.5)'
                      : '2px solid rgba(239, 68, 68, 0.5)',
                    cursor: 'pointer',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div className="analytics-card-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                    {analyticsData.netBalance >= 0 ? '📈' : '📉'}
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{Math.abs(analyticsData.netBalance).toLocaleString()}
                  </div>
                  <div className="analytics-card-label" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Net Balance
                  </div>
                  <div className="analytics-card-description" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                    {analyticsData.netBalance >= 0 ? '(Profit)' : '(Loss)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Month Cashbook Analytics */}
            <div 
              className="cashbook-analytics"
              style={{ 
                background: 'linear-gradient(135deg, rgba(140, 140, 120, 0.8), rgba(150, 230, 267, 0.6))',
                borderRadius: '16px',
                padding: '2.5rem',
                marginBottom: '2rem',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h3 
                className="cashbook-title"
                style={{ 
                  margin: '0 0 2rem 0', 
                  fontSize: '1.5rem', 
                  fontWeight: '600',
                  textAlign: 'center',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                📖 Current Month Cashbook Summary
              </h3>
              
              <div 
                className="cashbook-grid"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1.5rem',
                  width: '100%',
                  maxWidth: '800px',
                  margin: '0 auto'
                }}
              >
                {/* Monthly Income */}
                <div 
                  className="cashbook-card"
                  style={{
                    background: 'rgba(72, 187, 120, 0.4)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(72, 187, 120, 0.6)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💚</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{cashbookData.monthlyIncome.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Monthly Income
                  </div>
                </div>

                {/* Monthly Expense */}
                <div 
                  className="cashbook-card"
                  style={{
                    background: 'rgba(239, 68, 68, 0.4)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(239, 68, 68, 0.6)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💸</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{cashbookData.monthlyExpense.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Monthly Expense
                  </div>
                </div>

                {/* Net Balance */}
                <div 
                  className="cashbook-card"
                  style={{
                    background: cashbookData.monthlyNet >= 0 
                      ? 'rgba(72, 187, 120, 0.4)' 
                      : 'rgba(239, 68, 68, 0.4)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                    border: cashbookData.monthlyNet >= 0 
                      ? '2px solid rgba(72, 187, 120, 0.6)'
                      : '2px solid rgba(239, 68, 68, 0.6)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                    {cashbookData.monthlyNet >= 0 ? '📈' : '📉'}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{Math.abs(cashbookData.monthlyNet).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    {cashbookData.monthlyNet >= 0 ? 'Net Profit' : 'Net Loss'}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Customers Section */}
            {customers.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                {/* Top Creditors */}
                {topCustomers.highest.length > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    color: 'white'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 1.5rem 0', 
                      fontSize: '1.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🏆 Top 5 - You Will Give
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {topCustomers.highest.map((customer, index) => (
                        <div key={customer._id} style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/customer/${customer._id}`)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              background: '#2d3748',
                              borderRadius: '50%',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </div>
                            <span style={{ fontWeight: '600' }}>{customer.name}</span>
                          </div>
                          <div style={{ 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}>
                            ₹{customer.balance.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Debtors */}
                {topCustomers.lowest.length > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    color: 'white'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 1.5rem 0', 
                      fontSize: '1.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      💸 Top 5 - You Will Get
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {topCustomers.lowest.map((customer, index) => (
                        <div key={customer._id} style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/customer/${customer._id}`)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              background: '#2d3748',
                              borderRadius: '50%',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </div>
                            <span style={{ fontWeight: '600' }}>{customer.name}</span>
                          </div>
                          <div style={{ 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}>
                            ₹{Math.abs(customer.balance).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;