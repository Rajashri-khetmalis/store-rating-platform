import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate(data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'USER' ? '/stores' : '/owner');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src="/assets/store-rating-logo.svg" alt="RatePoint" />
        <h1>Welcome back</h1>
        <p className="muted">Sign in to your RatePoint account.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></label>
          <label>Password<input type="password" required value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></label>
          <button className="primary full" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
        </form>
        <p className="auth-switch">New user? <Link to="/signup">Create an account</Link></p>
        <div className="demo-box">
          <strong>Demo accounts</strong>
          <small>Admin: admin@example.com / Admin@123</small>
          <small>Owner: owner@example.com / Owner@123</small>
          <small>User: user@example.com / User@123</small>
        </div>
      </div>
    </div>
  );
}
