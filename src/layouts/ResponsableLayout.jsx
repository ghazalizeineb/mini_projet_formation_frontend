import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

function ResponsableLayout({ user, onLogout }) {
  const initials = user?.login?.substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: '#1a1f2e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        <div style={{ padding: '20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 500 }}>G</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Gestion Formation</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Excellent Training</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', padding: '10px 16px 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Principal
          </div>
          <a href="/responsable" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: '#8fa3ff', textDecoration: 'none', background: 'rgba(99,120,255,0.2)', borderRight: '2px solid #6378ff' }}>
            <span style={{ fontSize: 14 }}>▦</span> Dashboard
          </a>
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#fff' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#fff' }}>{user?.login}</div>
              <div style={{ fontSize: 10, color: '#7F77DD' }}>Responsable</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', background: 'rgba(226,75,74,0.15)', color: '#f09595', border: '0.5px solid rgba(226,75,74,0.3)', borderRadius: 8, padding: '7px', fontSize: 12, cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 52, background: '#fff', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{ fontSize: 12, background: '#eeedfe', color: '#534ab7', padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>
            Responsable
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Routes>
            <Route index element={<Dashboard user={user} basePath="/responsable" />} />
            <Route path="*" element={<Navigate to="/responsable" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default ResponsableLayout;