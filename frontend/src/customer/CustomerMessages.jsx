import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";
import {
  initializeSocket,
  disconnectSocket,
  sendMessage,
  onReceiveMessage,
  onMessageSent,
  sendTypingIndicator,
  onUserTyping,
  offReceiveMessage,
  offMessageSent,
  offUserTyping,
  markMessageAsRead
} from "../utils/socketService";

const CustomerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [userName, setUserName] = useState("Business Owner");
  const [customerId, setCustomerId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const customerData = localStorage.getItem("customerData");

    if (!token || !customerData) {
      navigate("/customerpanel/login");
      return;
    }

    const customer = JSON.parse(customerData);
    setCustomerId(customer._id);
    fetchMessages(token, customer._id);

    // Initialize socket for customer
    const socket = initializeSocket(token, 'customer');

    // Handle incoming messages
    const handleReceiveMessage = (message) => {
      if (message.customerId === customer._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        
        // Mark as read
        markMessageAsRead(message._id, customer._id, 'user');
      }
    };

    // Handle message sent confirmation
    const handleMessageSent = (message) => {
      if (message.customerId === customer._id) {
        // Message already added optimistically
      }
    };

    // Handle typing indicator
    const handleTyping = ({ userId, userType, isTyping }) => {
      if (userType === 'user') {
        setIsUserTyping(isTyping);
      }
    };

    onReceiveMessage(handleReceiveMessage);
    onMessageSent(handleMessageSent);
    onUserTyping(handleTyping);

    return () => {
      offReceiveMessage(handleReceiveMessage);
      offMessageSent(handleMessageSent);
      offUserTyping(handleTyping);
      disconnectSocket();
    };
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (token, custId) => {
    try {
      const response = await axios.get(
        `/api/customer-portal/chat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.messages || []);
      
      if (response.data.userName) {
        setUserName(response.data.userName);
      }
      
      // Mark all messages as read
      response.data.messages?.forEach((msg) => {
        if (msg.sender === 'user' && !msg.readBy?.includes('customer')) {
          markMessageAsRead(msg._id, custId, 'user');
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 401) {
        navigate("/customerpanel/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !customerId) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const tempMessage = {
      _id: Date.now(),
      message: messageText,
      sender: 'customer',
      customerId: customerId,
      createdAt: new Date(),
      readBy: []
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const token = localStorage.getItem("customerToken");
      const response = await axios.post(
        `/api/customer-portal/chat`,
        { message: messageText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the temp message with the real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id ? response.data.message : msg
        )
      );

      // Send via Socket.IO
      sendMessage(customerId, messageText, 'customer');
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the temp message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!customerId) return;
    
    // Send typing indicator
    sendTypingIndicator(customerId, true, 'customer');

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(customerId, false, 'customer');
    }, 1000);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <CustomerLayout currentPage="messages">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">Loading messages...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="messages">
      <div className="flex flex-col h-[calc(100vh-70px)] bg-white">
        {/* Chat Header */}
        <div className="bg-primary border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 m-0">{userName}</h2>
            {isUserTyping && (
              <p className="text-sm text-gray-500 m-0">typing...</p>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl text-gray-500 mb-2">No messages yet</p>
              <p className="text-gray-400">Start a conversation with {userName}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const showDate =
                  index === 0 ||
                  formatDate(messages[index - 1].createdAt) !==
                    formatDate(message.createdAt);

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${
                        message.sender === 'customer'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender === 'customer'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="m-0 break-words whitespace-pre-wrap">
                          {message.message}
                        </p>
                        <p
                          className={`text-xs mt-1 mb-0 ${
                            message.sender === 'customer'
                              ? 'text-blue-100'
                              : 'text-gray-400'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerMessages;
