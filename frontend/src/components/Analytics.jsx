import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import Notification from './Notification';
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
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCustomers();
    fetchAnalyticsData();
    fetchCashbookData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showNotification('Failed to load customer data', 'error');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get('/api/customers/analytics');
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      showNotification('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCashbookData = async () => {
    try {
      const response = await axios.get('/api/cashbook');
      const entries = response.data;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const currentMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      });
      
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
      showNotification('Failed to load cashbook data', 'error');
    }
  };

  const getTopCustomers = () => {
    const sortedByHighest = [...customers]
      .filter(c => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    const sortedByLowest = [...customers]
      .filter(c => c.balance < 0)
      .sort((a, b) => a.balance - b.balance)
      .slice(0, 5);

    return {
      highest: sortedByHighest,
      lowest: sortedByLowest
    };
  };

  const topCustomers = getTopCustomers();

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatBalance = (balance) => {
    return formatAmount(Math.abs(balance));
  };

  if (loading) {
    return (
      <Layout currentPage="/analytics">
        <div className="analytics-page">
          <div className="loading">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/analytics">
      <div className="analytics-page">
        <style jsx>{`
          .analytics-page {
            padding: 1rem;
            max-width: 1400px;
            margin: 0 auto;
          }

          .page-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            background: #008ae6;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
          }

          .page-subtitle {
            color: #6b7280;
            font-size: 1.1rem;
          }

          .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .analytics-card {
            border-radius: 16px;
            padding: 1.5rem;
            color: white;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          

          

          .analytics-card-content {
            position: relative;
            z-index: 1;
          }

          .analytics-card.customers {
            background: #5A9CB5;
          }

          .analytics-card.balance.positive {
            background: #22C55E;
          }

          .analytics-card.balance.negative {
            background: #EF4444;
          }

          .card-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          .card-label {
            font-size: 1rem;
            opacity: 0.9;
            margin-bottom: 0.25rem;
          }

          .card-description {
            font-size: 0.85rem;
            opacity: 0.7;
          }

          .cashbook-summary {
            background: #002699;
            border-radius: 16px;
            padding: 1.5rem;
            color: white;
            margin-bottom: 2rem;
          }

          .cashbook-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            text-align: center;
          }

          .cashbook-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .cashbook-item {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          .top-customers-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .customer-section {
            border-radius: 16px;
            padding: 1.5rem;
            color: white;
          }

          .customer-section.creditors {
            background:  #38a169;
          }

          .customer-section.debtors {
            background: #ff4d4d;
          }

          .section-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .customer-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .customer-item {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .customer-item:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateX(4px);
          }

          .customer-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .customer-rank {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 600;
          }

          .customer-details h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
          }

          .customer-phone {
            font-size: 0.85rem;
            opacity: 0.8;
            margin: 0;
          }

          .customer-balance {
            font-size: 1rem;
            font-weight: 600;
          }

          .no-data {
            text-align: center;
            padding: 3rem 1rem;
            color: #6b7280;
          }

          .no-data-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 3rem;
            font-size: 1.2rem;
            color: #6b7280;
          }

          /* Mobile Responsiveness */
          @media (max-width: 768px) {
            .analytics-page {
              padding: 0.5rem;
            }

            .page-title {
              font-size: 2rem;
            }

            .analytics-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .card-value {
              font-size: 1.5rem;
            }

            .top-customers-section {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .cashbook-grid {
              grid-template-columns: 1fr;
            }

            .customer-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }

            .customer-info {
              width: 100%;
            }

            .customer-balance {
              align-self: flex-end;
            }
          }

          @media (max-width: 480px) {
            .analytics-grid {
              grid-template-columns: 1fr;
            }
            
            .analytics-card {
              padding: 1rem;
            }
            
            .page-title {
              font-size: 1.5rem;
            }
            
            .card-value {
              font-size: 1.25rem;
            }
          }
        `}</style>

        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Business Analytics</h1>
          <p className="page-subtitle">Track your business performance and insights</p>
        </div>

        {/* Main Analytics Cards */}
        <div className="analytics-grid">
          {/* Total Customers */}
          <div className="analytics-card customers">
            <div className="analytics-card-content">
              <div className="card-value">{analyticsData.totalCustomers}</div>
              <div className="card-label">Total Customers</div>
              <div className="card-description">Active customers in your business</div>
            </div>
          </div>

          <div className="analytics-card" style={{ background: '#73AF6F' }}>
            <div className="analytics-card-content">
              <div className="card-value">{formatAmount(analyticsData.totalCreditAmount)}</div>
              <div className="card-label">Total Credit</div>
              <div className="card-description">You will receive</div>
            </div>
          </div>

          <div className="analytics-card" style={{ background: '#FF5555' }}>
            <div className="analytics-card-content">
              <div className="card-value">{formatAmount(analyticsData.totalDebitAmount)}</div>
              <div className="card-label">Total Debit</div>
              <div className="card-description">You will pay</div>
            </div>
          </div>

          {/* Net Balance */}
          <div className={`analytics-card balance ${analyticsData.netBalance >= 0 ? 'positive' : 'negative'}`}>
            <div className="analytics-card-content">
              <div className="card-value">{formatAmount(Math.abs(analyticsData.netBalance))}</div>
              <div className="card-label">Net Balance</div>
              <div className="card-description">
                {analyticsData.netBalance >= 0 ? 'Overall profit' : 'Overall loss'}
              </div>
            </div>
          </div>
        </div>

        <div className="cashbook-summary">
          <h3 className="cashbook-title">This Month's Cashbook Summary</h3>
          <div className="cashbook-grid">
            <div className="cashbook-item">
              <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {formatAmount(cashbookData.monthlyIncome)}
              </div>
              <div style={{ opacity: 0.9 }}>Monthly Income</div>
            </div>
            <div className="cashbook-item">
              <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {formatAmount(cashbookData.monthlyExpense)}
              </div>
              <div style={{ opacity: 0.9 }}>Monthly Expense</div>
            </div>
            <div className="cashbook-item">
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: cashbookData.monthlyNet >= 0 ? '#68d391' : '#feb2b2'
              }}>
                {formatAmount(Math.abs(cashbookData.monthlyNet))}
              </div>
              <div style={{ opacity: 0.9 }}>
                Net {cashbookData.monthlyNet >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers Section */}
        {customers.length > 0 ? (
          <div className="top-customers-section">
            {/* Top Creditors */}
            {topCustomers.highest.length > 0 && (
              <div className="customer-section creditors">
                <h3 className="section-title">
                  <span>💰</span> Top 5 - You Will Give
                </h3>
                <div className="customer-list">
                  {topCustomers.highest.map((customer, index) => (
                    <div 
                      key={customer._id} 
                      className="customer-item"
                      onClick={() => navigate(`/customer/${customer._id}`)}
                    >
                      <div className="customer-info">
                        <div className="customer-rank">{index + 1}</div>
                        <div className="customer-details">
                          <h4>{customer.name}</h4>
                          <p className="customer-phone">📞 {customer.phone}</p>
                        </div>
                      </div>
                      <div className="customer-balance">
                        {formatBalance(customer.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Debtors */}
            {topCustomers.lowest.length > 0 && (
              <div className="customer-section debtors">
                <h3 className="section-title">
                  <span>💸</span> Top 5 - You Will Get
                </h3>
                <div className="customer-list">
                  {topCustomers.lowest.map((customer, index) => (
                    <div 
                      key={customer._id} 
                      className="customer-item"
                      onClick={() => navigate(`/customer/${customer._id}`)}
                    >
                      <div className="customer-info">
                        <div className="customer-rank">{index + 1}</div>
                        <div className="customer-details">
                          <h4>{customer.name}</h4>
                          <p className="customer-phone">📞 {customer.phone}</p>
                        </div>
                      </div>
                      <div className="customer-balance">
                        {formatBalance(customer.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-data">
            <div className="no-data-icon">📊</div>
            <h3>No Customer Data</h3>
            <p>Add customers to see analytics and insights</p>
          </div>
        )}

        {/* Notification */}
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
      </div>
    </Layout>
  );
}

export default Analytics;
