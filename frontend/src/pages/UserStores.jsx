import React from "react";
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function UserStores() {
  const [stores,setStores]=useState([]);
  const [search,setSearch]=useState('');
  const [sort,setSort]=useState('name');
  const [direction,setDirection]=useState('ASC');
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(null);

  const load=async()=>{
    try{const {data}=await api.get('/stores',{params:{search,sort,direction}});setStores(data);}
    catch(err){setError(err.response?.data?.message||'Unable to load stores.');}
  };
  useEffect(()=>{load();},[search,sort,direction]);

  const submitRating=async(storeId,rating)=>{
    setSaving(storeId);setError('');
    try{await api.post('/ratings',{storeId,rating:Number(rating)});await load();}
    catch(err){setError(err.response?.data?.message||'Unable to submit rating.');}
    finally{setSaving(null);}
  };

  const sortBy=(field)=>{if(sort===field)setDirection(direction==='ASC'?'DESC':'ASC');else{setSort(field);setDirection('ASC');}};

  return <div>
    <div className="page-heading"><div><h1>Discover Stores</h1><p className="muted">Search stores and submit or modify your 1–5 rating.</p></div></div>
    {error&&<div className="alert error">{error}</div>}
    <section className="content-card">
      <div className="section-title"><div className="filters"><input className="search big" placeholder="Search by store name or address…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="sort-tabs"><button className={sort==='name'?'selected':''} onClick={()=>sortBy('name')}>Name {sort==='name'?(direction==='ASC'?'↑':'↓'):''}</button><button className={sort==='address'?'selected':''} onClick={()=>sortBy('address')}>Address {sort==='address'?(direction==='ASC'?'↑':'↓'):''}</button><button className={sort==='rating'?'selected':''} onClick={()=>sortBy('rating')}>Rating {sort==='rating'?(direction==='ASC'?'↑':'↓'):''}</button></div></div>
      <div className="store-grid">
        {stores.map(s=><article className="store-card" key={s.id}>
          <div className="store-icon">🏪</div><h3>{s.name}</h3><p>{s.address}</p>
          <div className="rating-line"><span>Overall</span><strong>⭐ {Number(s.overall_rating).toFixed(2)}</strong></div>
          <div className="rating-line"><span>Your rating</span><strong>{s.my_rating ? `⭐ ${s.my_rating}` : 'Not submitted'}</strong></div>
          <div className="rating-control"><label>{s.my_rating?'Modify rating':'Submit rating'}<select disabled={saving===s.id} value={s.my_rating || ''} onChange={e=>e.target.value&&submitRating(s.id,e.target.value)}><option value="">Choose 1–5</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} ⭐</option>)}</select></label></div>
        </article>)}
      </div>
      {!stores.length&&<div className="empty-state"><img src="/assets/empty-store.svg" alt="" /><h3>No stores found</h3><p>Try a different name or address.</p></div>}
    </section>
  </div>;
}
