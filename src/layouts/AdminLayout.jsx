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
  { to: '/admin/formations',    label: 'Formations' },
  { to: '/admin/participants',  label: 'Participants' },
  { to: '/admin/formateurs',   label: 'Formateurs' },
  { section: 'Référentiels' },
  { to: '/admin/domaines',      label: 'Domaines' },
  { to: '/admin/structures',   label: 'Structures' },
  { to: '/admin/profils',      label: 'Profils' },
  { to: '/admin/employeurs',    label: 'Employeurs' },
  { section: 'Administration' },
  { to: '/admin/roles',        label: 'Rôles' },
  { to: '/admin/utilisateurs',  label: 'Utilisateurs' },
];

function AdminLayout({ user, onLogout }) {
  const initials = user?.login?.substring(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'linear-gradient(135deg, #12082a 0%, #1e0a4a 50%, #12082a 100%)', fontFamily: "'Syne', 'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          margin: 1px 8px;
          border-radius: 8px;
          font-size: 13px;
          color: rgba(196,181,253,0.5);
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          transition: background 0.15s, color 0.15s;
        }
        .sidebar-link:hover {
          background: rgba(124,58,237,0.12);
          color: #c4b5fd;
        }
        .sidebar-link.active {
          background: rgba(124,58,237,0.2);
          color: #ede9fe;
          font-weight: 500;
          border: 1px solid rgba(139,92,246,0.2);
        }

        .logout-btn {
          width: 100%;
          background: transparent;
          color: #c4b5fd;
          border: 1px solid #7c3aed;
          border-radius: 8px;
          padding: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .logout-btn:hover { background: rgba(124,58,237,0.15); }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{
        width: 220,
        background: 'rgba(18,8,42,0.97)',
        borderRight: '1px solid rgba(167,139,250,0.12)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>

        {/* Brand */}
        <div style={{
          padding: '18px 16px',
          borderBottom: '1px solid rgba(167,139,250,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(124,58,237,0.3)',
              border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg> */}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ede9fe', fontFamily: "'Syne', sans-serif" }}>
                Excellent Training
              </div>
              <div style={{ fontSize: 10, color: '#6d5a99', fontFamily: "'Inter', sans-serif" }}>
                Administration
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} style={{
                fontSize: 10, color: '#4a3d6b',
                padding: '12px 16px 4px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}>
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

        {/* Footer sidebar */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(167,139,250,0.08)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 8, padding: '8px 10px',
            marginBottom: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(124,58,237,0.5)',
              border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#c4b5fd',
              fontFamily: "'Inter', sans-serif",
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: 12, color: '#c4b5fd',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.3,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.login}
              </div>
              <div style={{ fontSize: 10, color: '#7c3aed', fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>
                Administrateur
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{
          height: 56,
          background: 'rgba(18,8,42,0.97)',
          borderBottom: '1px solid rgba(167,139,250,0.12)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, color: '#4a3d6b', fontFamily: "'Inter', sans-serif" }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: 'rgba(124,58,237,0.15)',
            color: '#c4b5fd',
            border: '1px solid rgba(139,92,246,0.25)',
            padding: '4px 12px', borderRadius: 20,
            fontFamily: "'Inter', sans-serif",
            textTransform: 'uppercase', letterSpacing: '0.8px',
          }}>
            Administrateur
          </span>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '28px',
          background: 'transparent',
        }}>
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