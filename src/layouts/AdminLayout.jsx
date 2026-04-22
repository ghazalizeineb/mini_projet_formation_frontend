import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Formations from '../pages/Formations';
import Participants from '../pages/Participants';
import Formateurs from '../pages/Formateurs';
import Domaines from '../pages/Domaines';
import Structures from '../pages/Structures';
import Profils from '../pages/Profils';
import Employeurs from '../pages/Employeurs';
import Roles from '../pages/Roles';
import Utilisateurs from '../pages/Utilisateurs';

const navItems = [
  { section: 'Principal' },
  { to: '/admin', icon: '▦', label: 'Dashboard', end: true },
  { section: 'Gestion' },
  { to: '/admin/formations',   icon: '📋', label: 'Formations' },
  { to: '/admin/participants', icon: '👥', label: 'Participants' },
  { to: '/admin/formateurs',   icon: '🎓', label: 'Formateurs' },
  { section: 'Référentiels' },
  { to: '/admin/domaines',     icon: '📚', label: 'Domaines' },
  { to: '/admin/structures',   icon: '🏢', label: 'Structures' },
  { to: '/admin/profils',      icon: '🏷️', label: 'Profils' },
  { to: '/admin/employeurs',   icon: '🏭', label: 'Employeurs' },
  { section: 'Administration' },
  { to: '/admin/roles',        icon: '🔑', label: 'Rôles' },
  { to: '/admin/utilisateurs', icon: '⚙️', label: 'Utilisateurs' },
];

function AdminLayout({ user, onLogout }) {
  const initials = user?.login?.substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: '#1a1f2e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Brand */}
        <div style={{ padding: '20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e24b4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 500 }}>G</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Gestion Formation</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Excellent Training</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', padding: '10px 16px 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {item.section}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e24b4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#fff' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#fff' }}>{user?.login}</div>
              <div style={{ fontSize: 10, color: '#e24b4a' }}>Administrateur</div>
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
          <span style={{ fontSize: 12, background: '#fcebeb', color: '#a32d2d', padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>
            Administrateur
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Routes>
            <Route index element={<Dashboard user={user} basePath="/admin" />} />
            <Route path="formations"   element={<Formations />} />
            <Route path="participants" element={<Participants />} />
            <Route path="formateurs"   element={<Formateurs />} />
            <Route path="domaines"     element={<Domaines />} />
            <Route path="structures"   element={<Structures />} />
            <Route path="profils"      element={<Profils />} />
            <Route path="employeurs"   element={<Employeurs />} />
            <Route path="roles"        element={<Roles />} />
            <Route path="utilisateurs" element={<Utilisateurs />} />
            <Route path="*"            element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;