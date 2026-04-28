import { Routes, Route, Navigate } from 'react-router-dom';
import MesFormations from '../pages/MesFormations';

function UtilisateurLayout({ user, onLogout }) {
  const initials = user?.login?.substring(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#12082a', fontFamily: "'Syne', 'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .nav-logout-btn {
          background: rgba(239,68,68,0.08);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .nav-logout-btn:hover { background: rgba(239,68,68,0.15); }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        background: 'rgba(18,8,42,0.97)',
        padding: '0 40px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(167,139,250,0.12)',
        backdropFilter: 'blur(12px)',
      }}>

        {/* Logo gauche */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(124,58,237,0.3)',
            border: '1px solid rgba(139,92,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span style={{
            color: '#ede9fe', fontSize: 16, fontWeight: 700,
            fontFamily: "'Syne', sans-serif", letterSpacing: -0.3,
          }}>
            Excellent Training
          </span>
        </div>

        {/* Droite : user + déconnexion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Badge utilisateur */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 8, padding: '6px 12px',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(124,58,237,0.5)',
              border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#c4b5fd',
              fontFamily: "'Inter', sans-serif",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#c4b5fd', fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>
                {user?.login}
              </div>
              <div style={{ fontSize: 10, color: '#7c3aed', fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>
                Utilisateur
              </div>
            </div>
          </div>

          <button onClick={onLogout} style={{
  background: 'transparent',
  color: '#c4b5fd',
  border: '1px solid #7c3aed',
  borderRadius: 8,
  padding: '7px 18px',
  fontSize: 17,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  transition: 'background 0.15s',
}}>
  Déconnexion
</button>
        </div>
      </nav>

      {/* ── Contenu (sans padding, MesFormations gère son propre layout) ── */}
      <Routes>
        <Route index element={<MesFormations user={user} />} />
        <Route path="*" element={<Navigate to="/utilisateur" replace />} />
      </Routes>
    </div>
  );
}

export default UtilisateurLayout;