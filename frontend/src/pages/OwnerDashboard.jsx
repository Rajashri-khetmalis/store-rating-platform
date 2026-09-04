import React from "react";
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function OwnerDashboard(){
  const [data,setData]=useState({store:null,averageRating:0,raters:[]});
  const [error,setError]=useState('');
  useEffect(()=>{api.get('/owner/dashboard').then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||'Unable to load dashboard.'));},[]);
  return <div>
    <div className="page-heading"><div><h1>Store Owner Dashboard</h1><p className="muted">Monitor your store rating and the users who submitted ratings.</p></div></div>
    {error&&<div className="alert error">{error}</div>}
    {!data.store?<section className="content-card empty-state"><img src="/assets/empty-store.svg" alt=""/><h2>No store assigned</h2><p>Ask an administrator to assign a store to your account.</p></section>:
    <>
      <div className="owner-hero"><div><span className="eyebrow">YOUR STORE</span><h2>{data.store.name}</h2><p>{data.store.address}</p><small>{data.store.email}</small></div><div className="owner-rating"><span>Average Rating</span><strong>⭐ {Number(data.averageRating).toFixed(2)}</strong><small>{data.raters.length} rating(s)</small></div></div>
      <section className="content-card"><h2>Users who submitted ratings</h2><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Rating</th><th>Last Updated</th></tr></thead><tbody>{data.raters.map(r=><tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>⭐ {r.rating}</td><td>{new Date(r.updated_at).toLocaleString()}</td></tr>)}{!data.raters.length&&<tr><td colSpan="4">No ratings have been submitted yet.</td></tr>}</tbody></table></div></section>
    </>}
  </div>
}
