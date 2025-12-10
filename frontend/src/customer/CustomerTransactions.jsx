import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
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

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={() => navigate("/customer/portal")}
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
              <span style={{ fontSize: '1.25rem' }}>🏠</span>
              Dashboard
            </button>
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
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search by description or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
              Transaction History
            </h2>

            {filteredTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>
                No transactions found
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Description</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Debit</th>
                      <th style={{ padding: '1rem', textAlign: 'right', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.95rem' }}>
                          {new Date(transaction.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td style={{ padding: '1rem', color: '#1f2937', fontSize: '0.95rem', fontWeight: '500' }}>
                          {transaction.description || 'NONE'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444', fontWeight: '600', fontSize: '1rem' }}>
                          {transaction.type === 'debit' ? `₹${transaction.amount.toFixed(2)}` : '-'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontWeight: '600', fontSize: '1rem' }}>
                          {transaction.type === 'credit' ? `₹${transaction.amount.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTransactions;
