import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ModeratorPanel from './components/ModeratorPanel';
import './App.css';

// Custom Header component to handle visibility and layout
function Header({ theme, setTheme, token }) {
  const location = useLocation();
  const hideHeader = ['/login', '/signup'].includes(location.pathname);

  if (hideHeader) {
    return null; // Don't render the header on login or signup pages
  }

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <img src="/logo.png" alt="ME-CHAT Logo" className="logo-image" />
        </div>
        <div className="nav-buttons">
          {token && (
            <>
              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <button
                className="logout-button"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.reload();
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const token = localStorage.getItem('token');

  return (
    <div className={`app ${theme}`}>
      <Router>
        <Header theme={theme} setTheme={setTheme} token={token} />
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/moderator" element={token ? <ModeratorPanel /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;