function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user || !allowedRoles.includes(user?.role)) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '60vh', textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 8 }}>
          Accès refusé
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Vous n'avez pas les permissions pour accéder à cette page.
        </p>
      </div>
    );
  }
  return children;
}

export default ProtectedRoute;