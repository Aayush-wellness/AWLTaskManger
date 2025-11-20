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
  const [resetForm, setResetForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    setError('');

    if (resetForm.password !== resetForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (resetForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const res = await axios.post('/api/auth/reset-password', resetForm);
      setForgotPasswordMessage(res.data.message);
      setResetForm({ email: '', password: '', confirmPassword: '' });
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
          <form onSubmit={handleResetPassword}>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetForm.email}
              onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
              required
            />
            <div className="password-input-container">
              <input
                type={showResetPassword ? "text" : "password"}
                placeholder="New Password (min 6 characters)"
                value={resetForm.password}
                onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowResetPassword(!showResetPassword)}
              >
                {showResetPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="password-input-container">
              <input
                type={showResetConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={resetForm.confirmPassword}
                onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
              >
                {showResetConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button type="submit">Reset Password</button>
            <p className="back-to-login">
              <button 
                type="button" 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetForm({ email: '', password: '', confirmPassword: '' });
                  setError('');
                  setForgotPasswordMessage('');
                }}
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
