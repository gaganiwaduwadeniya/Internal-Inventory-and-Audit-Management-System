import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../utils/services';
import { validatePassword } from '../utils/passwordValidator';
import '../styles/auth.css';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid reset link');
    }
  }, [email, token]);

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(validatePassword(newPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordStrength?.isValid) {
      setError('Password does not meet complexity requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(email, token, newPassword);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess('Password reset successful! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate(response.data.user.role === 'Admin' ? '/admin-dashboard' : '/employee-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>Equipment Management System</h1>
          <h2>Reset Password</h2>
          <div className="error-message">{error}</div>
          <p style={{ textAlign: 'center' }}>
            <a href="/login">Back to Login</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Equipment Management System</h1>
        <h2>Reset Password</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {passwordStrength && (
              <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                <div style={{ 
                  color: passwordStrength.isValid ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  Strength: {passwordStrength.strength.toUpperCase()}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                  {!passwordStrength.requirements.minLength && <div>❌ At least 8 characters</div>}
                  {passwordStrength.requirements.minLength && <div style={{ color: '#28a745' }}>✓ At least 8 characters</div>}
                  
                  {!passwordStrength.requirements.hasUppercase && <div>❌ One uppercase letter</div>}
                  {passwordStrength.requirements.hasUppercase && <div style={{ color: '#28a745' }}>✓ One uppercase letter</div>}
                  
                  {!passwordStrength.requirements.hasLowercase && <div>❌ One lowercase letter</div>}
                  {passwordStrength.requirements.hasLowercase && <div style={{ color: '#28a745' }}>✓ One lowercase letter</div>}
                  
                  {!passwordStrength.requirements.hasNumber && <div>❌ One number</div>}
                  {passwordStrength.requirements.hasNumber && <div style={{ color: '#28a745' }}>✓ One number</div>}
                  
                  {!passwordStrength.requirements.hasSpecialChar && <div>❌ One special character</div>}
                  {passwordStrength.requirements.hasSpecialChar && <div style={{ color: '#28a745' }}>✓ One special character</div>}
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {newPassword && confirmPassword && (
              <div style={{ 
                marginTop: '8px', 
                color: newPassword === confirmPassword ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '❌ Passwords do not match'}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !passwordStrength?.isValid || newPassword !== confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p style={{ marginTop: '8px', textAlign: 'center', marginBottom: 0 }}>
          <a href="/login">Back to Login</a>
        </p>
      </div>
    </div>
  );
}
