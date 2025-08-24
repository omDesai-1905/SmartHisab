import React from 'react';

function Notification({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-icon">
        {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
      </div>
      <span className="notification-message">{notification.message}</span>
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Notification;
