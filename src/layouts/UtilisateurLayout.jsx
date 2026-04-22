import { Routes, Route, Navigate } from 'react-router-dom';
import MesFormations from '../pages/MesFormations';

function UtilisateurLayout({ user, onLogout }) {
  const initials = user?.login?.substring(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>

      {/* Navbar */}
      <div style={{ background: '#1a1f2e', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 500 }}>G</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Gestion Formation</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Excellent Training</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#fff' }}>{user?.login}</div>
              <div style={{ fontSize: 10, color: '#1D9E75' }}>Utilisateur</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(226,75,74,0.2)', color: '#f09595', border: '0.5px solid rgba(226,75,74,0.3)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '24px 32px' }}>
        <Routes>
          <Route index element={<MesFormations user={user} />} />
          <Route path="*" element={<Navigate to="/utilisateur" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default UtilisateurLayout;