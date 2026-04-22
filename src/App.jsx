import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import FormationsPubliques from './pages/FormationsPubliques';
import AdminLayout from './layouts/AdminLayout';
import ResponsableLayout from './layouts/ResponsableLayout';
import UtilisateurLayout from './layouts/UtilisateurLayout';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← ajout

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // ← fin du chargement
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  // ← pendant le chargement on n'affiche rien
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f5f7'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#6378ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 18, color: '#fff', fontWeight: 500
          }}>G</div>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        {/* Pages publiques */}
        <Route path="/" element={<FormationsPubliques />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />

        {/* Espace Admin — accès direct */}
        <Route path="/admin/*" element={
          <AdminLayout user={user} onLogout={handleLogout} />
        } />

        {/* Espace Responsable — accès direct */}
        <Route path="/responsable/*" element={
          <ResponsableLayout user={user} onLogout={handleLogout} />
        } />

        {/* Espace Utilisateur — doit être connecté */}
        <Route path="/utilisateur/*" element={
          user?.role === 'SIMPLE_UTILISATEUR'
            ? <UtilisateurLayout user={user} onLogout={handleLogout} />
            : <Navigate to="/login" replace />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;