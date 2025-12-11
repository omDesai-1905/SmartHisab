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
        <div className="p-4 max-w-7xl mx-auto">
          <div className="text-center py-12 text-xl text-gray-500">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/analytics">
      <div className="p-4 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">Business Analytics</h1>
          <p className="text-gray-500 text-lg">Track your business performance and insights</p>
        </div>

        {/* Main Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-[#5A9CB5] rounded-2xl p-6 text-white text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="relative z-[1]">
              <div className="text-4xl font-bold mb-2">{analyticsData.totalCustomers}</div>
              <div className="text-base opacity-90 mb-1">Total Customers</div>
              <div className="text-sm opacity-70">Active customers in your business</div>
            </div>
          </div>

          <div className="bg-accent rounded-2xl p-6 text-white text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="relative z-[1]">
              <div className="text-4xl font-bold mb-2">{formatAmount(analyticsData.totalCreditAmount)}</div>
              <div className="text-base opacity-90 mb-1">Total Credit</div>
              <div className="text-sm opacity-70">You will receive</div>
            </div>
          </div>

          <div className="bg-[#FF5555] rounded-2xl p-6 text-white text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="relative z-[1]">
              <div className="text-4xl font-bold mb-2">{formatAmount(analyticsData.totalDebitAmount)}</div>
              <div className="text-base opacity-90 mb-1">Total Debit</div>
              <div className="text-sm opacity-70">You will pay</div>
            </div>
          </div>

          {/* Net Balance */}
          <div className={`${analyticsData.netBalance >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-2xl p-6 text-white text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden`}>
            <div className="relative z-[1]">
              <div className="text-4xl font-bold mb-2">{formatAmount(Math.abs(analyticsData.netBalance))}</div>
              <div className="text-base opacity-90 mb-1">Net Balance</div>
              <div className="text-sm opacity-70">
                {analyticsData.netBalance >= 0 ? 'Overall profit' : 'Overall loss'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#002699] rounded-2xl p-6 text-white mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-center">This Month's Cashbook Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold mb-2">
                {formatAmount(cashbookData.monthlyIncome)}
              </div>
              <div className="opacity-90">Monthly Income</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold mb-2">
                {formatAmount(cashbookData.monthlyExpense)}
              </div>
              <div className="opacity-90">Monthly Expense</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className={`text-2xl font-semibold mb-2 ${cashbookData.monthlyNet >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatAmount(Math.abs(cashbookData.monthlyNet))}
              </div>
              <div className="opacity-90">
                Net {cashbookData.monthlyNet >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers Section */}
        {customers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Creditors */}
            {topCustomers.highest.length > 0 && (
              <div className="bg-green-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span>💰</span> Top 5 - You Will Give
                </h3>
                <div className="flex flex-col gap-3">
                  {topCustomers.highest.map((customer, index) => (
                    <div 
                      key={customer._id} 
                      className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center hover:bg-white/25 hover:translate-x-1 transition-all cursor-pointer"
                      onClick={() => navigate(`/customer/${customer._id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">{index + 1}</div>
                        <div>
                          <h4 className="text-base font-semibold m-0">{customer.name}</h4>
                          <p className="text-sm opacity-80 m-0">📞 {customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-base font-semibold">
                        {formatBalance(customer.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Debtors */}
            {topCustomers.lowest.length > 0 && (
              <div className="bg-red-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span>💸</span> Top 5 - You Will Get
                </h3>
                <div className="flex flex-col gap-3">
                  {topCustomers.lowest.map((customer, index) => (
                    <div 
                      key={customer._id} 
                      className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center hover:bg-white/25 hover:translate-x-1 transition-all cursor-pointer"
                      onClick={() => navigate(`/customer/${customer._id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">{index + 1}</div>
                        <div>
                          <h4 className="text-base font-semibold m-0">{customer.name}</h4>
                          <p className="text-sm opacity-80 m-0">📞 {customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-base font-semibold">
                        {formatBalance(customer.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Customer Data</h3>
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
