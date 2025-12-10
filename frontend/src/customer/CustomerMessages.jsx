import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

const CustomerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    type: "general"
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      navigate("/customer/login");
      return;
    }

    fetchMessages(token);
  }, [navigate]);

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
      if (error.response?.status === 401) {
        navigate("/customer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("customerToken");

    try {
      await axios.post(
        "http://localhost:5001/api/customer-portal/send-message",
        messageForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Message sent successfully!");
      setShowMessageModal(false);
      setMessageForm({ subject: "", message: "", type: "general" });
      fetchMessages(token);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <CustomerLayout currentPage="messages">
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
    <CustomerLayout currentPage="messages">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              Messages
            </h2>
            <button
              onClick={() => setShowMessageModal(true)}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span>
              New Message
            </button>
          </div>

          {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  No messages yet
                </p>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                  Click "New Message" to contact your business owner
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      background: '#fafafa'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                        {msg.subject}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontWeight: '700',
                            background: msg.type === 'complaint' ? '#fee2e2' : msg.type === 'dispute' ? '#fed7aa' : '#dbeafe',
                            color: msg.type === 'complaint' ? '#991b1b' : msg.type === 'dispute' ? '#9a3412' : '#1e40af'
                          }}
                        >
                          {msg.type.toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontWeight: '700',
                            background: msg.status === 'resolved' ? '#d1fae5' : msg.status === 'in-progress' ? '#fef3c7' : '#e5e7eb',
                            color: msg.status === 'resolved' ? '#065f46' : msg.status === 'in-progress' ? '#92400e' : '#374151'
                          }}
                        >
                          {msg.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#4b5563', margin: '0 0 1rem 0', lineHeight: '1.6' }}>
                      {msg.message}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: 0 }}>
                      📅 {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })} at {new Date(msg.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {msg.reply && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                          💬 Reply from Business Owner:
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#1e3a8a', margin: 0, lineHeight: '1.6' }}>
                          {msg.reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowMessageModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: '#3b82f6', color: 'white', padding: '1.5rem', borderRadius: '16px 16px 0 0' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Send New Message</h3>
              <p style={{ opacity: 0.9, margin: '0.5rem 0 0 0' }}>Contact your business owner</p>
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Message Type
                </label>
                <select
                  value={messageForm.type}
                  onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="complaint">Complaint</option>
                  <option value="dispute">Transaction Dispute</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  placeholder="Brief description"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Message
                </label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  placeholder="Write your message here..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageForm({ subject: "", message: "", type: "general" });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#3b82f6',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerMessages;
