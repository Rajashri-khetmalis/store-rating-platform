import React from "react";
import { useState } from 'react';
import api from '../services/api';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const { data } = await api.put('/auth/password', form);
      setMessage(data.message);
      setForm({ currentPassword:'', newPassword:'' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update password.');
    }
  };

  return (
    <section className="content-card narrow">
      <h1>Change Password</h1>
      <p className="muted">Use the required password format.</p>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit}>
        <label>Current Password<input type="password" required value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/></label>
        <label>New Password<input type="password" required value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label>
        <button className="primary">Update Password</button>
      </form>
    </section>
  );
}
