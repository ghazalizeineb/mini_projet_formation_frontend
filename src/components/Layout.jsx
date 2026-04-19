import { NavLink } from 'react-router-dom';

const navItems = [
  { section: 'Principal' },
  { to: '/',             icon: '▦', label: 'Dashboard' },
  { to: '/formations',   icon: '📋', label: 'Formations' },
  { to: '/participants', icon: '👥', label: 'Participants' },
  { to: '/formateurs',   icon: '🎓', label: 'Formateurs' },
  { section: 'Référentiels' },
  { to: '/domaines',     icon: '📚', label: 'Domaines' },
  { to: '/structures',   icon: '🏢', label: 'Structures' },
  { to: '/profils',      icon: '🏷️', label: 'Profils' },
  { to: '/employeurs',   icon: '🏭', label: 'Employeurs' },
  { section: 'Administration' },
  { to: '/utilisateurs', icon: '⚙️', label: 'Utilisateurs' },
];

function Layout({ user, onLogout, children }) {
  const initials = user?.login?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: '#1a1f2e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#6378ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff', fontWeight: 500, flexShrink: 0 }}>
              G
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Gestion Formation</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Excellent Training</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', padding: '10px 16px 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {item.section}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* User footer */}
        <div style={{ padding: '12px 16px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6378ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.login}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{ width: '100%', background: 'rgba(226,75,74,0.15)', color: '#f09595', border: '0.5px solid rgba(226,75,74,0.3)', borderRadius: 8, padding: '7px', fontSize: 12, cursor: 'pointer' }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ height: 52, background: '#fff', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;