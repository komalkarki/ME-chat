import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const userResponse = await axios.get('http://localhost:5000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);

        const postsResponse = await axios.get('http://localhost:5000/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(postsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        localStorage.removeItem('token');
        onLogout(); // Call the logout handler
        navigate('/login');
      }
    };

    fetchUserAndPosts();
  }, [navigate, onLogout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setContent('');
      setImage(null);
      const response = await axios.get('http://localhost:5000/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout(); // Call the logout handler
    navigate('/', { replace: true });
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">ME-CHAT</div>
        <div className="navbar-menu">
          <span className="navbar-item">Welcome, {user?.name}</span>
          <button className="navbar-item" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <div className="dashboard-content">
        <h1>User Dashboard</h1>
        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">Post</button>
        </form>
        <div className="posts">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <p>{post.content}</p>
              {post.image_url && <img src={`http://localhost:5000${post.image_url}`} alt="Post" />}
              <p>Posted by {post.user_name} on {new Date(post.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;