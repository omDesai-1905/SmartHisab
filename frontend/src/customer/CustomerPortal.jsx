import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerPortal = () => {
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const customerData = localStorage.getItem("customerData");

    if (!token || !customerData) {
      navigate("/customer/login");
      return;
    }

    setCustomer(JSON.parse(customerData));
    fetchTransactions(token);
    fetchMessages(token);
  }, [navigate]);

  const fetchTransactions = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/customer-portal/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(response.data.transactions);
      setTotalBalance(response.data.totalBalance);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/customer-portal/messages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    navigate("/customer/login");
  };

  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalCredit - totalDebit;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f7fa' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        {/* Sidebar Header */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: 'white', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700' }}>
              {customer?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', margin: 0, lineHeight: 1.2 }}>
                {customer?.name}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                {customer?.customerId}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '1rem' }}>
          <nav>
            <button
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🏠</span>
              Dashboard
            </button>
            <button
              onClick={() => navigate("/customer/transactions")}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>📋</span>
              Transaction History
            </button>
            <button
              onClick={() => navigate("/customer/messages")}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>💬</span>
              Messages
              {messages.filter(m => m.status === 'pending').length > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  marginLeft: 'auto'
                }}>
                  {messages.filter(m => m.status === 'pending').length}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Stats */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.75rem 0', fontWeight: '600', textTransform: 'uppercase' }}>Quick Stats</p>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '0.75rem', color: '#15803d', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Total Credit</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>₹{totalCredit.toFixed(2)}</p>
            </div>
            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <p style={{ fontSize: '0.75rem', color: '#991b1b', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Total Debit</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626', margin: 0 }}>₹{totalDebit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          {/* Welcome Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
              Welcome back, {customer?.name}!
            </h1>
            <p style={{ fontSize: '1rem', color: '#6b7280' }}>
              Here's an overview of your account
            </p>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Total Credit Card */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>💰</span>
                </div>
              </div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Credit
              </h3>
              <p style={{ fontSize: '2.25rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>
                ₹{totalCredit.toFixed(2)}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                All incoming payments
              </p>
            </div>

            {/* Total Debit Card */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>💸</span>
                </div>
              </div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Debit
              </h3>
              <p style={{ fontSize: '2.25rem', fontWeight: '700', color: '#dc2626', margin: 0 }}>
                ₹{totalDebit.toFixed(2)}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                All outgoing payments
              </p>
            </div>

            {/* Balance Card */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: balance >= 0 ? '2px solid #bfdbfe' : '2px solid #fed7aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: balance >= 0 ? '#dbeafe' : '#fed7aa', padding: '0.75rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>{balance >= 0 ? '📈' : '📉'}</span>
                </div>
              </div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Balance
              </h3>
              <p style={{ fontSize: '2.25rem', fontWeight: '700', color: balance >= 0 ? '#2563eb' : '#ea580c', margin: 0 }}>
                ₹{balance.toFixed(2)}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                {balance >= 0 ? 'You have receivable' : 'You have payable'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <button
                onClick={() => navigate("/customer/transactions")}
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '2rem' }}>📋</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>View All Transactions</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.25rem' }}>
                    See your complete transaction history
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate("/customer/messages")}
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '2rem' }}>💬</span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Send Message</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.25rem' }}>
                    Contact your business owner
                  </div>
                </div>
                {messages.filter(m => m.status === 'pending').length > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '12px',
                    fontWeight: '700'
                  }}>
                    {messages.filter(m => m.status === 'pending').length} pending
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
