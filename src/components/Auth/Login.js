// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(credentials.email, credentials.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2><i className="fas fa-sign-in-alt"></i> Login</h2>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className="form-group">
          <i className="fas fa-envelope input-icon"></i>
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <i className="fas fa-lock input-icon"></i>
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Logging in...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i> Login
            </>
          )}
        </button>

        <div className="auth-links">
          Don't have an account?{' '}
          <Link to="/register" className="register-link">
            <i className="fas fa-user-plus"></i> Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;