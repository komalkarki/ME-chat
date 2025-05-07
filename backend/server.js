const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });
const db = new sqlite3.Database('./db.sqlite');

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, 'secret_key');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Database setup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    age INTEGER
  )`);
  // Add age column if it doesn't exist
  db.run(`ALTER TABLE users ADD COLUMN age INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding age column:', err);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Seed dummy data
  const hashedPassword = bcrypt.hashSync('password123', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role, age) VALUES 
    ('Admin', 'admin@example.com', ?, 'moderator', 30),
    ('User1', 'user1@example.com', ?, 'user', 22)`, [hashedPassword, hashedPassword]);
});

// API Endpoints

// Signup
app.post('/signup', (req, res) => {
  const { name, email, password, age } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (name, email, password, age) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, age],
    (err) => {
      if (err) return res.status(400).json({ message: 'Email already exists' });
      res.json({ message: 'User created' });
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key');
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  });
});

// Get all posts
app.get('/posts', authenticate, (req, res) => {
  db.all('SELECT posts.*, users.name FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC', (err, rows) => {
    res.json(rows);
  });
});

// Create a post
app.post('/posts', authenticate, upload.single('image'), (req, res) => {
  const { content } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  db.run('INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)', [req.user.id, content, image_url], (err) => {
    if (err) return res.status(500).json({ message: 'Error creating post' });
    res.json({ message: 'Post created' });
  });
});

// Get comments for a post
app.get('/posts/:id/comments', authenticate, (req, res) => {
  db.all('SELECT comments.*, users.name FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ?', [req.params.id], (err, rows) => {
    res.json(rows);
  });
});

// Add a comment
app.post('/posts/:id/comments', authenticate, (req, res) => {
  const { content } = req.body;
  db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [req.params.id, req.user.id, content], (err) => {
    if (err) return res.status(500).json({ message: 'Error adding comment' });
    db.run('INSERT INTO notifications (user_id, content) SELECT user_id, ? FROM posts WHERE id = ?', 
      [`${req.user.name} commented on your post`, req.params.id]);
    res.json({ message: 'Comment added' });
  });
});

// Get notifications
app.get('/notifications', authenticate, (req, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    res.json(rows);
  });
});

// Mark notification as read
app.post('/notifications/:id/read', authenticate, (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error updating notification' });
    res.json({ message: 'Notification marked as read' });
  });
});

app.listen(5000, () => console.log('Server running on port 5000'));