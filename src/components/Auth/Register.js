// src/components/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' // default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Register user
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      console.log('Registration successful:', response);

      // Automatically log in after successful registration
      await login(formData.email, formData.password);
      
      // Redirect based on role
      navigate(formData.role === 'teacher' ? '/dashboard' : '/classes');
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2><i className="fas fa-user-plus"></i> Register</h2>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className="form-group">
          <i className="fas fa-user input-icon"></i>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <i className="fas fa-envelope input-icon"></i>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <i className="fas fa-lock input-icon"></i>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <i className="fas fa-lock input-icon"></i>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="student"
              checked={formData.role === 'student'}
              onChange={handleChange}
              disabled={loading}
            />
            <i className="fas fa-user-graduate"></i> Student
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={formData.role === 'teacher'}
              onChange={handleChange}
              disabled={loading}
            />
            <i className="fas fa-chalkboard-teacher"></i> Teacher
          </label>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Registering...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i> Register
            </>
          )}
        </button>

        <div className="auth-links">
          Already have an account?{' '}
          <Link to="/login" className="login-link">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;