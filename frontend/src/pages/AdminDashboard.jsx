import React from "react";
import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyUser = { name:'',email:'',address:'',password:'',role:'USER' };
const emptyStore = { name:'',email:'',address:'',ownerId:'' };

export default function AdminDashboard() {
  const [stats,setStats] = useState({totalUsers:0,totalStores:0,totalRatings:0});
  const [users,setUsers] = useState([]);
  const [stores,setStores] = useState([]);
  const [owners,setOwners] = useState([]);
  const [userSearch,setUserSearch] = useState('');
  const [role,setRole] = useState('');
  const [storeSearch,setStoreSearch] = useState('');
  const [userSort,setUserSort] = useState('name');
  const [storeSort,setStoreSort] = useState('name');
  const [userDir,setUserDir] = useState('ASC');
  const [storeDir,setStoreDir] = useState('ASC');
  const [userForm,setUserForm] = useState(emptyUser);
  const [storeForm,setStoreForm] = useState(emptyStore);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');

  const load = async () => {
    try {
      const [d,u,s] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users',{params:{search:userSearch,role,sort:userSort,direction:userDir}}),
        api.get('/admin/stores',{params:{search:storeSearch,sort:storeSort,direction:storeDir}})
      ]);
      setStats(d.data); setUsers(u.data); setStores(s.data);
      setOwners(u.data.filter(x=>x.role==='STORE_OWNER'));
    } catch (err) { setError(err.response?.data?.message || 'Unable to load admin data.'); }
  };

  useEffect(()=>{ load(); },[userSearch,role,storeSearch,userSort,storeSort,userDir,storeDir]);

  const createUser = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try { await api.post('/admin/users',userForm); setMessage('User created successfully.'); setUserForm(emptyUser); load(); }
    catch(err){setError(err.response?.data?.message || 'Unable to create user.');}
  };

  const createStore = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    try { await api.post('/admin/stores',storeForm); setMessage('Store created successfully.'); setStoreForm(emptyStore); load(); }
    catch(err){setError(err.response?.data?.message || 'Unable to create store.');}
  };

  const sortButton = (field, current, setField, direction, setDirection) => (
    <button className="sort-btn" onClick={() => {
      if (current === field) setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
      else { setField(field); setDirection('ASC'); }
    }}>{field} {current===field ? (direction==='ASC'?'↑':'↓') : '↕'}</button>
  );

  return (
    <div>
      <div className="page-heading"><div><h1>System Administrator</h1><p className="muted">Manage users, stores, ratings and platform data.</p></div></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span>Total Users</span><strong>{stats.totalUsers}</strong></div>
        <div className="stat-card"><span>Total Stores</span><strong>{stats.totalStores}</strong></div>
        <div className="stat-card"><span>Submitted Ratings</span><strong>{stats.totalRatings}</strong></div>
      </div>

      <div className="two-col">
        <section className="content-card">
          <h2>Add User</h2>
          <form onSubmit={createUser}>
            <label>Name (20–60)<input required value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})}/></label>
            <label>Email<input type="email" required value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})}/></label>
            <label>Address<textarea required maxLength="400" value={userForm.address} onChange={e=>setUserForm({...userForm,address:e.target.value})}/></label>
            <label>Password<input type="password" required value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})}/></label>
            <label>Role<select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})}><option value="USER">Normal User</option><option value="ADMIN">Admin</option><option value="STORE_OWNER">Store Owner</option></select></label>
            <button className="primary">Add User</button>
          </form>
        </section>

        <section className="content-card">
          <h2>Add Store</h2>
          <form onSubmit={createStore}>
            <label>Store Name<input required value={storeForm.name} onChange={e=>setStoreForm({...storeForm,name:e.target.value})}/></label>
            <label>Email<input type="email" required value={storeForm.email} onChange={e=>setStoreForm({...storeForm,email:e.target.value})}/></label>
            <label>Address<textarea required maxLength="400" value={storeForm.address} onChange={e=>setStoreForm({...storeForm,address:e.target.value})}/></label>
            <label>Store Owner<select value={storeForm.ownerId} onChange={e=>setStoreForm({...storeForm,ownerId:e.target.value})}><option value="">No owner assigned</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name} — {o.email}</option>)}</select></label>
            <button className="primary">Add Store</button>
          </form>
        </section>
      </div>

      <section className="content-card">
        <div className="section-title"><div><h2>Stores</h2><p className="muted">Name, email, address and overall rating.</p></div><input className="search" placeholder="Search name, email or address…" value={storeSearch} onChange={e=>setStoreSearch(e.target.value)}/></div>
        <div className="table-wrap"><table><thead><tr><th>{sortButton('name',storeSort,setStoreSort,storeDir,setStoreDir)}</th><th>{sortButton('email',storeSort,setStoreSort,storeDir,setStoreDir)}</th><th>{sortButton('address',storeSort,setStoreSort,storeDir,setStoreDir)}</th><th>{sortButton('rating',storeSort,setStoreSort,storeDir,setStoreDir)}</th><th>Owner</th></tr></thead>
        <tbody>{stores.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>⭐ {Number(s.rating).toFixed(2)}</td><td>{s.owner_name || '—'}</td></tr>)}{!stores.length&&<tr><td colSpan="5">No stores found.</td></tr>}</tbody></table></div>
      </section>

      <section className="content-card">
        <div className="section-title"><div><h2>Users</h2><p className="muted">Normal users, admins and store owners.</p></div><div className="filters"><input className="search" placeholder="Search name, email or address…" value={userSearch} onChange={e=>setUserSearch(e.target.value)}/><select value={role} onChange={e=>setRole(e.target.value)}><option value="">All Roles</option><option value="USER">Normal User</option><option value="ADMIN">Admin</option><option value="STORE_OWNER">Store Owner</option></select></div></div>
        <div className="table-wrap"><table><thead><tr><th>{sortButton('name',userSort,setUserSort,userDir,setUserDir)}</th><th>{sortButton('email',userSort,setUserSort,userDir,setUserDir)}</th><th>{sortButton('address',userSort,setUserSort,userDir,setUserDir)}</th><th>{sortButton('role',userSort,setUserSort,userDir,setUserDir)}</th><th>Rating</th></tr></thead>
        <tbody>{users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td><span className="badge">{u.role}</span></td><td>{u.role==='STORE_OWNER' ? `⭐ ${Number(u.rating).toFixed(2)}` : '—'}</td></tr>)}{!users.length&&<tr><td colSpan="5">No users found.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}
