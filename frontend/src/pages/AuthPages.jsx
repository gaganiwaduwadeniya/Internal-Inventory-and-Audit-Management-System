import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/services';
import { validatePassword } from '../utils/passwordValidator';
import '../styles/auth.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate(response.data.user.role === 'Admin' ? '/admin-dashboard' : '/employee-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Equipment Management System</h1>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '8px', textAlign: 'center', marginBottom: 0 }}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
        <p style={{ marginTop: '8px', textAlign: 'center', marginBottom: 0 }}>
          Forgot password? <a href="/forgot-password">Reset here</a>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordStrength?.isValid) {
      setError('Password does not meet complexity requirements');
      return;
    }

    setLoading(true);

    try {
      await authService.register(username, email, password, role);
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Equipment Management System</h1>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={!!success}
            />
          </div>
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
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!!success}
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
            <label htmlFor="role">Role:</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={!!success}>
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading || !!success || !passwordStrength?.isValid}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '8px', textAlign: 'center', marginBottom: 0 }}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
