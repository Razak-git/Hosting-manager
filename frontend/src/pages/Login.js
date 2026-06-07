import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⚡</div>
          <h1>Hosting Manager</h1>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your control panel</p>

        {error && <div className="hm-alert hm-alert-error mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="hm-label">Email address</label>
            <input
              type="email"
              className="form-control hm-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="hm-label">Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control hm-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '16px', padding: '0',
                }}
              >
                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-hm w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="hm-spinner me-2"></span>
                Signing in...
              </>
            ) : (
              <>Sign in <i className="bi bi-arrow-right ms-1"></i></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
