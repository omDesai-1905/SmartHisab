import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const CustomerLayout = ({ children, currentPage }) => {
  const [customer, setCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const customerData = localStorage.getItem("customerData");

    if (!token || !customerData) {
      navigate("/customer/login");
      return;
    }

    setCustomer(JSON.parse(customerData));
    
    // Fetch messages for badge count
    const fetchMessages = async () => {
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

    fetchMessages();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    navigate("/customer/login");
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        {/* Sidebar Header */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#9CCAD9', color: 'white', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700' }}>
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
                background: currentPage === 'portal' ? '#9CCAD9' : 'transparent',
                color: currentPage === 'portal' ? '#2F3E46' : '#6b7280',
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
                background: currentPage === 'transactions' ? '#9CCAD9' : 'transparent',
                color: currentPage === 'transactions' ? '2F3E46' : '#6b7280',
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
                background: currentPage === 'messages' ? '#9CCAD9' : 'transparent',
                color: currentPage === 'messages' ? '#2F3E46' : '#6b7280',
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
        {children}
      </div>
    </div>
  );
};

export default CustomerLayout;
