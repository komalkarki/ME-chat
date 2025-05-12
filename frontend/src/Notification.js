import React from 'react';
import axios from 'axios';

function Notification({ notification }) {
  const token = localStorage.getItem('token');

  const markAsRead = () => {
    axios.post(
      `http://localhost:5000/notifications/${notification.id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <div className={`notification ${notification.is_read ? 'read' : ''}`}>
      <p>{notification.content}</p>
      {!notification.is_read && (
        <button onClick={markAsRead}>Mark as Read</button>
      )}
    </div>
  );
}

export default Notification;