import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function Dashboard({ user }) {
  const [stats, setStats] = useState({ formations: 0, participants: 0, formateurs: 0, domaines: 0 });
  const [formations, setFormations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [f, p, fo, d] = await Promise.all([
          api.get('/formations'),
          api.get('/participants'),
          api.get('/formateurs'),
          api.get('/domaines'),
        ]);
        setStats({ formations: f.data.length, participants: p.data.length, formateurs: fo.data.length, domaines: d.data.length });
        setFormations(f.data.slice(0, 5));
      } catch (e) { console.error(e); }
    };
    fetchAll();
  }, []);

  const domaineBadge = (libelle) => {
    const map = { 'Informatique': 'badge-blue', 'Finance': 'badge-amber', 'Management': 'badge-teal', 'Comptabilité': 'badge-purple', 'Mécanique': 'badge-coral' };
    return map[libelle] || 'badge-blue';
  };

  const statCards = [
    { label: 'Formations', value: stats.formations, sub: 'Total', color: '#6378ff', path: '/formations' },
    { label: 'Participants', value: stats.participants, sub: 'Inscrits', color: '#1D9E75', path: '/participants' },
    { label: 'Formateurs', value: stats.formateurs, sub: 'Actifs', color: '#f59e0b', path: '/formateurs' },
    { label: 'Domaines', value: stats.domaines, sub: 'Catégories', color: '#e24b4a', path: '/domaines' },
  ];

  return (
    <div>
      {/* Bienvenue */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
          Bonjour, {user?.login} 👋
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Voici un aperçu de votre plateforme de formation.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.path)}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label" style={{ marginTop: 4 }}>{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Dernières formations */}
      <div className="page-card">
        <div className="page-card-header">
          <span className="page-card-title">Dernières formations</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/formations')}>Voir tout</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Année</th>
              <th>Durée</th>
              <th>Domaine</th>
              <th>Formateur</th>
              <th>Budget</th>
              <th>Participants</th>
            </tr>
          </thead>
          <tbody>
            {formations.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 500 }}>{f.titre}</td>
                <td>{f.annee}</td>
                <td>{f.duree} j</td>
                <td><span className={`badge ${domaineBadge(f.domaine?.libelle)}`}>{f.domaine?.libelle}</span></td>
                <td>{f.formateur?.nom} {f.formateur?.prenom}</td>
                <td>{f.budget?.toLocaleString()} DT</td>
                <td>
                  <span className="badge badge-teal">{f.participants?.length || 0} inscrits</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {formations.length === 0 && <div className="empty-state">Aucune formation enregistrée.</div>}
      </div>
    </div>
  );
}

export default Dashboard;