import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function Dashboard({ basePath = '/admin' }) {
  const [stats, setStats] = useState({
    formations: 0, participants: 0, formateurs: 0, domaines: 0,
    budget_total: 0, formations_annee_courante: 0,
    formateurs_internes: 0, formateurs_externes: 0,
  });
  const [formations, setFormations] = useState([]);
  const [topFormations, setTopFormations] = useState([]);
  const [formationsByDomaine, setFormationsByDomaine] = useState([]);
  const [formationsByAnnee, setFormationsByAnnee] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const anneeActuelle = new Date().getFullYear();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fRes, pRes, foRes, dRes] = await Promise.all([
        api.get('/formations'),
        api.get('/participants'),
        api.get('/formateurs'),
        api.get('/domaines'),
      ]);

      const allFormations = fRes.data;
      const allFormateurs = foRes.data;

      // Calculs statistiques
      const budgetTotal = allFormations.reduce((sum, f) => sum + (f.budget || 0), 0);
      const formationsAnnee = allFormations.filter(f => f.annee === anneeActuelle);
      const formateursInternes = allFormateurs.filter(f => f.type === 'INTERNE');
      const formateursExternes = allFormateurs.filter(f => f.type === 'EXTERNE');

      setStats({
        formations: allFormations.length,
        participants: pRes.data.length,
        formateurs: allFormateurs.length,
        domaines: dRes.data.length,
        budget_total: budgetTotal,
        formations_annee_courante: formationsAnnee.length,
        formateurs_internes: formateursInternes.length,
        formateurs_externes: formateursExternes.length,
      });

      setFormations(allFormations);

      // Top formations par nombre de participants
      const top = [...allFormations]
        .sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
        .slice(0, 5);
      setTopFormations(top);

      // Formations par domaine
      const byDomaine = {};
      allFormations.forEach(f => {
        const d = f.domaine?.libelle || 'Autre';
        byDomaine[d] = (byDomaine[d] || 0) + 1;
      });
      setFormationsByDomaine(
        Object.entries(byDomaine)
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Formations par année
      const byAnnee = {};
      allFormations.forEach(f => {
        const a = f.annee;
        byAnnee[a] = (byAnnee[a] || 0) + 1;
      });
      setFormationsByAnnee(
        Object.entries(byAnnee)
          .map(([annee, count]) => ({ annee, count }))
          .sort((a, b) => a.annee - b.annee)
      );

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const domaineBadge = (libelle) => {
    const map = {
      'Informatique': { bg: '#e6f1fb', color: '#185fa5' },
      'Finance':      { bg: '#faeeda', color: '#854f0b' },
      'Management':   { bg: '#e1f5ee', color: '#0f6e56' },
      'Comptabilité': { bg: '#eeedfe', color: '#534ab7' },
      'Mécanique':    { bg: '#faece7', color: '#993c1d' },
    };
    return map[libelle] || { bg: '#e8e8fb', color: '#4f46e5' };
  };

  // Barre de progression pour le graphique
  const maxDomaine = Math.max(...formationsByDomaine.map(d => d.count), 1);
  const maxAnnee = Math.max(...formationsByAnnee.map(a => a.count), 1);

  const domaineColors = ['#6378ff', '#1D9E75', '#f59e0b', '#e24b4a', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary"></div>
          <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
          Bonjour, {user?.login} 👋
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          Tableau de bord — Centre de formation Excellent Training —
          <span style={{ color: '#6378ff', fontWeight: 500 }}> {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
      </div>

      {/* KPI Cards principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Formations totales', value: stats.formations,  color: '#6378ff', sub: `${stats.formations_annee_courante} cette année`, path: `${basePath}/formations` },
          { label: 'Participants', value: stats.participants,  color: '#1D9E75', sub: 'inscrits au total', path: `${basePath}/participants` },
          { label: 'Formateurs', value: stats.formateurs,color: '#f59e0b', sub: `${stats.formateurs_internes} int. / ${stats.formateurs_externes} ext.`, path: `${basePath}/formateurs` },
          { label: 'Budget total', value: stats.budget_total.toLocaleString() + ' DT',  color: '#e24b4a', sub: 'toutes formations confondues', path: null },
        ].map(card => (
          <div key={card.label}
            onClick={() => card.path && navigate(card.path)}
            style={{
              background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14,
              padding: '18px 20px', cursor: card.path ? 'pointer' : 'default',
              transition: 'box-shadow 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={e => card.path && (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)')}
            onMouseLeave={e => card.path && (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: card.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>
                {card.icon}
              </div>
              {card.path && (
                <span style={{ fontSize: 11, color: '#6378ff', cursor: 'pointer' }}>Voir →</span>
              )}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: '#374151', fontWeight: 500, marginBottom: 2 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* KPI secondaires */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Formations ' + anneeActuelle, value: stats.formations_annee_courante,  color: '#8b5cf6' },
          { label: 'Formateurs internes', value: stats.formateurs_internes,  color: '#06b6d4' },
          { label: 'Formateurs externes', value: stats.formateurs_externes,  color: '#f97316' },
          { label: 'Domaines actifs', value: stats.domaines, color: '#10b981' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 14,
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: card.color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              flexShrink: 0
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>{card.value}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Formations par domaine */}
        <div style={{
          background: '#fff', border: '0.5px solid #e5e7eb',
          borderRadius: 14, padding: '20px 24px'
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
               Formations par domaine
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              Répartition par domaine de formation
            </div>
          </div>
          {formationsByDomaine.map((d, i) => (
            <div key={d.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: domaineColors[i % domaineColors.length]
                  }} />
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{d.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                  {d.count} <span style={{ color: '#9ca3af', fontWeight: 400 }}>formation{d.count > 1 ? 's' : ''}</span>
                </span>
              </div>
              <div style={{ height: 6, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(d.count / maxDomaine) * 100}%`,
                  background: domaineColors[i % domaineColors.length],
                  borderRadius: 10,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
          {formationsByDomaine.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aucune donnée</p>
          )}
        </div>

        {/* Formations par année */}
        <div style={{
          background: '#fff', border: '0.5px solid #e5e7eb',
          borderRadius: 14, padding: '20px 24px'
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
               Évolution par année
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              Nombre de formations organisées par année
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, padding: '0 8px' }}>
            {formationsByAnnee.map((a, i) => (
              <div key={a.annee} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{a.count}</span>
                <div style={{
                  width: '100%',
                  height: `${(a.count / maxAnnee) * 110}px`,
                  background: a.annee === anneeActuelle
                    ? 'linear-gradient(180deg, #6378ff, #4f6ef7)'
                    : 'linear-gradient(180deg, #c7d2fe, #e0e7ff)',
                  borderRadius: '6px 6px 0 0',
                  minHeight: 8,
                  transition: 'height 0.5s ease'
                }} />
                <span style={{ fontSize: 10, color: '#6b7280', fontWeight: a.annee === anneeActuelle ? 600 : 400 }}>
                  {a.annee}
                </span>
              </div>
            ))}
            {formationsByAnnee.length === 0 && (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, width: '100%' }}>Aucune donnée</p>
            )}
          </div>
        </div>
      </div>

      {/* Top formations + Dernières formations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>

        {/* Top 5 formations */}
        <div style={{
          background: '#fff', border: '0.5px solid #e5e7eb',
          borderRadius: 14, padding: '20px 24px'
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
               Top formations
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              Par nombre de participants inscrits
            </div>
          </div>
          {topFormations.map((f, i) => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < topFormations.length - 1 ? '0.5px solid #f3f4f6' : 'none'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : i === 2 ? '#fde8e0' : '#f9fafb',
                color: i === 0 ? '#d97706' : i === 1 ? '#6b7280' : i === 2 ? '#c2410c' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 500, color: '#111827',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {f.titre}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  {f.domaine?.libelle} — {f.annee}
                </div>
              </div>
              <div style={{
                background: '#e1f5ee', color: '#0f6e56',
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, flexShrink: 0
              }}>
                {f.participants?.length || 0} inscrits
              </div>
            </div>
          ))}
          {topFormations.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aucune formation</p>
          )}
        </div>

        {/* Tableau dernières formations */}
        <div style={{
          background: '#fff', border: '0.5px solid #e5e7eb',
          borderRadius: 14, overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '0.5px solid #e5e7eb',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                 Dernières formations
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                Les 5 dernières formations enregistrées
              </div>
            </div>
            <button
              onClick={() => navigate(`${basePath}/formations`)}
              style={{
                background: '#6378ff', color: '#fff', border: 'none',
                borderRadius: 8, padding: '6px 14px', fontSize: 12,
                fontWeight: 500, cursor: 'pointer'
              }}>
              Voir tout
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Titre', 'Année', 'Domaine', 'Formateur', 'Budget', 'Inscrits'].map(h => (
                  <th key={h} style={{
                    fontSize: 11, fontWeight: 500, color: '#6b7280',
                    padding: '10px 14px', textAlign: 'left',
                    borderBottom: '0.5px solid #e5e7eb', background: '#f9fafb'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formations.slice(0, 5).map((f, i) => {
                const badge = domaineBadge(f.domaine?.libelle);
                return (
                  <tr key={f.id} style={{ borderBottom: '0.5px solid #f3f4f6' }}>
                    <td style={{ fontSize: 12, fontWeight: 500, color: '#111827', padding: '11px 14px', maxWidth: 160 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.titre}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: '#374151', padding: '11px 14px' }}>{f.annee}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: badge.bg, color: badge.color,
                        fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20
                      }}>
                        {f.domaine?.libelle}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#374151', padding: '11px 14px' }}>
                      {f.formateur?.nom} {f.formateur?.prenom}
                    </td>
                    <td style={{ fontSize: 12, color: '#374151', padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      {f.budget?.toLocaleString()} DT
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: '#e1f5ee', color: '#0f6e56',
                        fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20
                      }}>
                        {f.participants?.length || 0}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {formations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 13 }}>
              Aucune formation enregistrée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;