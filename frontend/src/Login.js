import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null); // Track selected role
  const [showSignup, setShowSignup] = useState(false); // Toggle between login and signup
  const [signupData, setSignupData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Set the initial role from URL query params only once when the component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialRole = queryParams.get('role');
    if (initialRole) {
      setRole(initialRole);
    }
  }, [location.search]);

  // Handle Login Submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:5000/login', { email, password })
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        navigate(res.data.user.role === 'moderator' ? '/moderator' : '/dashboard');
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  // Handle Signup Submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const { name, age, email, password, confirmPassword } = signupData;
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    axios
      .post('http://localhost:5000/signup', { name, email, password, age })
      .then(() => {
        alert('Signup successful! Please log in.');
        setShowSignup(false);
        setRole(null); // Reset to show role selection
        navigate('/login');
      })
      .catch((err) => alert(err.response.data.message));
  };

  // Handle Signup Form Input Changes
  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  // If no role is selected, show the role selection buttons with background
  if (!role) {
    return (
      <div className="container login-container role-selection">
        <div className="login-options">
          <img src="/logo.png" alt="ME-CHAT Logo" className="login-logo" />
          <h2>Welcome to ME-CHAT</h2>
          <button
            className="role-button user-button"
            onClick={() => navigate('/login?role=user')}
          >
            Login as User
          </button>
          <button
            className="role-button mod-button"
            onClick={() => navigate('/login?role=moderator')}
          >
            Login as Moderator
          </button>
        </div>
      </div>
    );
  }

  // Show signup form if toggled
  if (showSignup) {
    return (
      <div className="container">
        <form className="form" onSubmit={handleSignupSubmit}>
          <h2>Join ME-CHAT</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={signupData.name}
              onChange={handleSignupChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={signupData.age}
              onChange={handleSignupChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={signupData.email}
              onChange={handleSignupChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={signupData.password}
              onChange={handleSignupChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              required
            />
          </div>
          <button type="submit">Sign Up</button>
          <p className="toggle-link">
            Already have an account?{' '}
            <span onClick={() => setShowSignup(false)}>Login</span>
          </p>
        </form>
      </div>
    );
  }

  // Show login form
  return (
    <div className="container">
      <form className="form" onSubmit={handleLoginSubmit}>
        <h2>Login to ME-CHAT</h2>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Continue</button>
        <p className="toggle-link">
          Don't have an account?{' '}
          <span onClick={() => setShowSignup(true)}>Sign Up</span>
        </p>
      </form>
    </div>
  );
}

export default Login;