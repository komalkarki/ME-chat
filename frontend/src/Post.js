import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Post({ post }) {
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(`http://localhost:5000/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setComments(res.data));
  }, [post.id, token]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        `http://localhost:5000/posts/${post.id}/comments`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setCommentContent('');
        axios
          .get(`http://localhost:5000/posts/${post.id}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setComments(res.data));
      });
  };

  return (
    <div className="post">
      <h3>{post.name}</h3>
      <p>{post.content}</p>
      {post.image_url && <img src={`http://localhost:5000${post.image_url}`} alt="Post" />}
      <div className="comments">
        <h4>Comments</h4>
        {comments.map((comment) => (
          <p key={comment.id}>
            <strong>{comment.name}:</strong> {comment.content}
          </p>
        ))}
        <form onSubmit={handleCommentSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment"
              required
            />
          </div>
          <button type="submit">Comment</button>
        </form>
      </div>
    </div>
  );
}

export default Post;