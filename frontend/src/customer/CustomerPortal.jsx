import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerPortal = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/customer/login");
      return;
    }

    fetchTransactions(token);
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
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response?.status === 401) {
        navigate("/customer/login");
      }
    } finally {
      setLoading(false);
    }
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
      <CustomerLayout currentPage="portal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="portal">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
            Welcome back!
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280' }}>
            Here's an overview of your account
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Total Credit Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #658C58' }}>
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
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #A72703' }}>
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
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: balance >= 0 ? '2px solid #3B9797' : '2px solid #BF092F' }}>
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
                border: '2px solid blue',
                background: '#f0f9ff',
                color: '#4E56C0',
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
                border: '2px solid green',
                background: '#f0fff0',
                color: 'green',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
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
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerPortal;
