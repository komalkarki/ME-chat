import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from './Post';
import Notification from './Notification';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('http://localhost:5000/posts', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setPosts(res.data));
    axios
      .get('http://localhost:5000/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(res.data));
  }, [token]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);
    axios
      .post('http://localhost:5000/posts', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setContent('');
        setImage(null);
        axios
          .get('http://localhost:5000/posts', { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => setPosts(res.data));
      });
  };

  return (
    <div className="container">
      <div className="form post-form">
        <h2>Create a Post</h2>
        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <button type="submit">Post</button>
        </form>
      </div>
      <h2>Your Feed</h2>
      <div className="feed">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      <h2>Notifications</h2>
      <div className="notifications">
        {notifications.map((notif) => (
          <Notification key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;