import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', address:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 20 || form.name.trim().length > 60) return setError('Name must be between 20 and 60 characters.');
    if (form.address.trim().length > 400) return setError('Address must be at most 400 characters.');
    if (form.password.length < 8 || form.password.length > 16 || !/[A-Z]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      return setError('Password must be 8–16 characters and include an uppercase letter and a special character.');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <img className="auth-logo" src="/assets/store-rating-logo.svg" alt="RatePoint" />
        <h1>Create account</h1>
        <p className="muted">Normal users can register here.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <label>Full Name (20–60 characters)<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
          <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
          <label>Address<textarea required maxLength="400" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></label>
          <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
          <small className="hint">8–16 characters, at least one uppercase letter and one special character.</small>
          <button className="primary full" disabled={loading}>{loading ? 'Creating…' : 'Sign up'}</button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
