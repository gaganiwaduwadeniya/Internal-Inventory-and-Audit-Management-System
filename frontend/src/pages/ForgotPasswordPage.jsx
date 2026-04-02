import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/services';
import '../styles/auth.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccess('Password reset link has been sent to your email!');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Equipment Management System</h1>
        <h2>Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!success}
            />
          </div>
          <button type="submit" disabled={loading || !!success}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <p style={{ marginTop: '8px', textAlign: 'center', marginBottom: 0 }}>
          Remember your password? <a href="/login">Login here</a>
        </p>
        <p style={{ marginTop: '8px', textAlign: 'center', marginBottom: 0 }}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}
