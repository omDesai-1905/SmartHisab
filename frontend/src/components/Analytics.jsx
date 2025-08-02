import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Analytics() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
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

  // Calculate summary statistics
  const calculateSummary = () => {
    let totalCredit = 0;
    let totalDebit = 0;
    let customerCount = customers.length;

    customers.forEach(customer => {
      if (customer.balance > 0) {
        totalDebit += customer.balance; // You will give
      } else if (customer.balance < 0) {
        totalCredit += Math.abs(customer.balance); // You will get
      }
    });

    return { totalCredit, totalDebit, customerCount };
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

  const summary = calculateSummary();
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

        {customers.length === 0 ? (
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
            {/* Enhanced Overall Summary */}
            <div style={{ 
              background: '#269bb9',
              borderRadius: '16px',
              padding: '2.5rem',
              marginBottom: '2rem',
              color: 'white',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}>
              <h2 style={{ 
                margin: '0 0 2rem 0', 
                fontSize: '2rem', 
                fontWeight: '700',
                textAlign: 'center',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}>
                📈 Financial Overview
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '2rem' 
              }}>
                {/* Total Customers */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {summary.customerCount}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                    Total Customers
                  </div>
                </div>

                {/* Debit Amount box */}
                <div style={{
                  background: 'rgba(251, 146, 60, 0.3)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(251, 146, 60, 0.5)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{summary.totalDebit.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                    Total Debit Amount
                  </div>
                </div>

                {/* Credit Amount box*/}
                <div style={{
                  background: 'rgba(72, 187, 120, 0.3)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(72, 187, 120, 0.5)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    ₹{summary.totalCredit.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                    Total Credit Amount
                  </div>
                </div>
              </div>
            </div>

            {/* Top Customers */}
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
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onClick={() => navigate(`/customer/${customer._id}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            minWidth: '2rem',
                            textAlign: 'center'
                          }}>
                            {index + 1}.
                          </span>
                          <span style={{ fontWeight: '600' }}>{customer.name}</span>
                        </div>
                        <span style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold',
                          color: '#f0fff4'
                        }}>
                          ₹{customer.balance.toLocaleString()}
                        </span>
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
                    📉 Top 5 - You Will Get
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
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onClick={() => navigate(`/customer/${customer._id}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold',
                            minWidth: '2rem',
                            textAlign: 'center'
                          }}>
                            {index + 1}.
                          </span>
                          <span style={{ fontWeight: '600' }}>{customer.name}</span>
                        </div>
                        <span style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 'bold',
                          color: '#fff5f5'
                        }}>
                          ₹{Math.abs(customer.balance).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              borderRadius: '12px',
              padding: '2rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>
                🚀 Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => navigate('/dashboard')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📋 View All Customers
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
