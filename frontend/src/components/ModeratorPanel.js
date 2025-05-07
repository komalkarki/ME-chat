import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ModeratorPanel() {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('http://localhost:5000/posts', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setPosts(res.data));
  }, [token]);

  return (
    <div className="container">
      <h2>Moderator Panel</h2>
      <p>Manage community posts and settings.</p>
      <div className="feed">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <h3>{post.name}</h3>
            <p>{post.content}</p>
            {post.image_url && <img src={`http://localhost:5000${post.image_url}`} alt="Post" />}
            <button style={{ background: '#dc3545', marginTop: '0.5rem' }}>
              Delete Post
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModeratorPanel;