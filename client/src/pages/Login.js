import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/auth/login', formData);
      login(res.data.token, res.data.user);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    setError('');

    try {
      await axios.post('/api/auth/forgot-password', { email: forgotPasswordEmail });
      setForgotPasswordMessage('Password reset email sent! Check your inbox.');
      setForgotPasswordEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Task Management</h1>
        <h2>{showForgotPassword ? 'Reset Password' : 'Login'}</h2>
        {error && <div className="error-message">{error}</div>}
        {forgotPasswordMessage && <div className="success-message">{forgotPasswordMessage}</div>}
        
        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button type="submit">Login</button>
            <p className="forgot-password-link">
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)}
                className="link-button"
              >
                Forgot Password?
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
            />
            <button type="submit">Send Reset Email</button>
            <p className="back-to-login">
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="link-button"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}
        
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
