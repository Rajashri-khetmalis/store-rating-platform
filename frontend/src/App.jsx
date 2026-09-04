import React from 'react';
import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import api from './services/api';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';
import ChangePassword from './pages/ChangePassword';

function Layout({ user, onLogout, children }) {
  const location = useLocation();
  const links = user.role === 'ADMIN'
    ? [{ to: '/admin', label: 'Admin Dashboard' }]
    : user.role === 'USER'
      ? [{ to: '/stores', label: 'Stores' }]
      : [{ to: '/owner', label: 'Owner Dashboard' }];

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={links[0].to}>
          <img src="/assets/store-rating-logo.svg" alt="" />
          <span>RatePoint</span>
        </Link>
        <nav>
          {links.map((link) => <Link key={link.to} className={location.pathname === link.to ? 'active' : ''} to={link.to}>{link.label}</Link>)}
          <Link to="/change-password">Change Password</Link>
          <button className="link-button" onClick={onLogout}>Logout</button>
        </nav>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}

function PrivateRoute({ user, roles, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const onStorage = () => {
      const saved = localStorage.getItem('user');
      setUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const home = !user ? '/login' : user.role === 'ADMIN' ? '/admin' : user.role === 'USER' ? '/stores' : '/owner';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={home} replace />} />
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route path="/signup" element={<Signup onLogin={setUser} />} />
      <Route path="/admin" element={<PrivateRoute user={user} roles={['ADMIN']}><Layout user={user} onLogout={logout}><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/stores" element={<PrivateRoute user={user} roles={['USER']}><Layout user={user} onLogout={logout}><UserStores /></Layout></PrivateRoute>} />
      <Route path="/owner" element={<PrivateRoute user={user} roles={['STORE_OWNER']}><Layout user={user} onLogout={logout}><OwnerDashboard /></Layout></PrivateRoute>} />
      <Route path="/change-password" element={<PrivateRoute user={user} roles={['ADMIN','USER','STORE_OWNER']}><Layout user={user} onLogout={logout}><ChangePassword /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}
