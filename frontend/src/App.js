import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import ModeratorPanel from './ModeratorPanel';
import './App.css';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [isFetchingRole, setIsFetchingRole] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching user role, token:', token);

      if (token) {
        setIsFetchingRole(true);
        try {
          const response = await axios.get('http://localhost:5000/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetch user role response:', response.data);
          setRole(response.data.role);
        } catch (err) {
          console.error('Fetch user role error:', err.response?.data || err.message);
          localStorage.removeItem('token');
          setRole(null);
        } finally {
          setIsFetchingRole(false);
        }
      } else {
        console.log('No token found, setting role to null');
        setRole(null);
        setIsFetchingRole(false);
      }
    };

    fetchUserRole();
  }, [location.pathname]); // Re-fetch role when the path changes

  useEffect(() => {
    if (isFetchingRole) return; // Wait until role fetch is complete

    console.log('Current location:', location.pathname, 'Role:', role);

    // Define protected routes that require a role
    const protectedRoutes = ['/dashboard', '/moderator'];
    const authRoutes = ['/login', '/signup'];

    // If a token exists and role is fetched
    if (role) {
      // If on auth routes or root, redirect to the appropriate route
      if (authRoutes.includes(location.pathname) || location.pathname === '/' || location.pathname.includes('/login') || location.pathname.includes('/signup')) {
        if (role === 'moderator') {
          console.log('Role is moderator, redirecting to /moderator');
          navigate('/moderator', { replace: true });
        } else if (role === 'user') {
          console.log('Role is user, redirecting to /dashboard');
          navigate('/dashboard', { replace: true });
        }
      }
      // If on a protected route, ensure the role matches
      else if (protectedRoutes.includes(location.pathname)) {
        if (role === 'moderator' && location.pathname !== '/moderator') {
          console.log('Role is moderator but not on /moderator, redirecting');
          navigate('/moderator', { replace: true });
        } else if (role === 'user' && location.pathname !== '/dashboard') {
          console.log('Role is user but not on /dashboard, redirecting');
          navigate('/dashboard', { replace: true });
        }
      }
    }
    // If no role (not logged in), redirect to login if on a protected route
    else if (protectedRoutes.includes(location.pathname)) {
      console.log('No role, redirecting to /login');
      navigate('/login', { replace: true });
    }
  }, [role, location.pathname, navigate, isFetchingRole]);

  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/moderator" element={<ModeratorPanel />} />
    </Routes>
  );
};

const RoleSelection = () => {
  const navigate = useNavigate();
  return (
    <div className="role-selection">
      <div className="overlay" />
      <div className="login-options">
        <img src="/logo.png" alt="ME-CHAT Logo" className="logo-image" />
        <h1>Welcome to ME-CHAT</h1>
        <button onClick={() => navigate('/login?role=user')}>Login as User</button>
        <button onClick={() => navigate('/login?role=moderator')}>Login as Moderator</button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;