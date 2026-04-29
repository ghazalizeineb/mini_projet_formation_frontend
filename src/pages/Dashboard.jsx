import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/axiosConfig';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#6366f1', '#14b8a6'];

function Dashboard({ user, basePath = '/admin' }) {
  const [stats, setStats] = useState({
    formations: 0, participants: 0, formateurs: 0,
    domaines: 0, budgetTotal: 0
  });
  const [formations, setFormations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fRes, pRes, dRes, sRes, foRes] = await Promise.all([
        api.get('/formations'),
        api.get('/participants'),
        api.get('/domaines'),
        api.get('/structures'),
        api.get('/formateurs'),
      ]);
      setFormations(fRes.data);
      setParticipants(pRes.data);
      setDomaines(dRes.data);
      setStructures(sRes.data);

      const budgetTotal = fRes.data.reduce((sum, f) => sum + (f.budget || 0), 0);
      setStats({
        formations: fRes.data.length,
        participants: pRes.data.length,
        formateurs: foRes.data.length,
        domaines: dRes.data.length,
        budgetTotal
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Données graphiques ──────────────────────────────────

  // 1. Évolution formations par année (courbe)
  const formationsParAnnee = () => {
    const map = {};
    formations.forEach(f => {
      map[f.annee] = (map[f.annee] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a - b)
      .map(([annee, count]) => ({ annee, formations: count }));
  };

  // 2. Répartition par domaine (camembert)
  const formationsParDomaine = () => {
    const map = {};
    formations.forEach(f => {
      const label = f.domaine?.libelle || 'Autre';
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  // 3. Inscriptions par structure (barres)
  const inscriptionsParStructure = () => {
    const map = {};
    participants.forEach(p => {
      const label = p.structure?.libelle
        ? p.structure.libelle.replace('Direction Régionale de ', 'D.R. ').replace('Direction des ', 'Dir. ').replace('Direction ', 'Dir. ')
        : 'Autre';
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([structure, participants]) => ({ structure, participants }));
  };

  // 4. Top 5 formations (barres horizontales)
  const topFormations = () => {
    return [...formations]
      .sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
      .slice(0, 5)
      .map(f => ({
        titre: f.titre.length > 30 ? f.titre.substring(0, 30) + '...' : f.titre,
        inscrits: f.participants?.length || 0,
        budget: f.budget
      }));
  };

  // 5. Budget par domaine (barres)
  const budgetParDomaine = () => {
    const map = {};
    formations.forEach(f => {
      const label = f.domaine?.libelle || 'Autre';
      map[label] = (map[label] || 0) + (f.budget || 0);
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([domaine, budget]) => ({
        domaine: domaine.length > 20 ? domaine.substring(0, 20) + '..' : domaine,
        budget
      }));
  };

  // ── Styles ──────────────────────────────────────────────
  const cardStyle = {
    background: '#13131f',
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: 12, padding: '20px 24px'
  };

  const titleStyle = {
    fontSize: 14, fontWeight: 600, color: '#f1f0ff',
    marginBottom: 20, paddingBottom: 12,
    borderBottom: '1px solid rgba(139,92,246,0.12)'
  };

  const tooltipStyle = {
    backgroundColor: '#13131f',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 8, color: '#f1f0ff', fontSize: 12
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipStyle}>
          <div style={{ padding: '8px 12px' }}>
            <p style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: 4 }}>{label}</p>
            {payload.map((p, i) => (
              <p key={i} style={{ color: p.color, margin: '2px 0' }}>
                {p.name} : {typeof p.value === 'number' && p.value > 100
                  ? p.value.toLocaleString('fr-TN') + ' DT'
                  : p.value}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.3)' }}>
        Chargement du tableau de bord...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif' }}>

      {/* En-tête */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f0ff', marginBottom: 4 }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          Suivi et évaluation des activités du centre FormaPro
        </p>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Formations',   value: stats.formations,               color: '#8b5cf6', sub: 'Total' },
          { label: 'Participants', value: stats.participants,              color: '#10b981', sub: 'Inscrits' },
          { label: 'Formateurs',   value: stats.formateurs,               color: '#f59e0b', sub: 'Actifs' },
          { label: 'Domaines',     value: stats.domaines,                  color: '#3b82f6', sub: 'Catégories' },
          { label: 'Budget total', value: stats.budgetTotal.toLocaleString('fr-TN') + ' DT', color: '#ec4899', sub: 'Toutes années', big: true },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: '16px 18px' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            </div>
            <div style={{ fontSize: s.big ? 16 : 26, fontWeight: 700, color: '#f1f0ff', lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Ligne 1 : Courbe + Camembert ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Évolution formations par année */}
        <div style={cardStyle}>
          <div style={titleStyle}>📈 Évolution des formations par année</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={formationsParAnnee()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis dataKey="annee" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Line type="monotone" dataKey="formations" name="Formations" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par domaine */}
        <div style={cardStyle}>
          <div style={titleStyle}>🥧 Répartition des formations par domaine</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={formationsParDomaine()}
                cx="45%" cy="50%" outerRadius={85} innerRadius={40}
                dataKey="value" nameKey="name"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
              >
                {formationsParDomaine().map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical" align="right" verticalAlign="middle"
                wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Ligne 2 : Barres structures + Top formations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Participants par structure */}
        <div style={cardStyle}>
          <div style={titleStyle}>🏢 Participants par structure</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={inscriptionsParStructure()} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis dataKey="structure" stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                angle={-35} textAnchor="end" interval={0} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="participants" name="Participants" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 formations */}
        <div style={cardStyle}>
          <div style={titleStyle}>🏆 Top 5 formations par inscriptions</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topFormations()} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="titre" width={130}
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="inscrits" name="Inscrits" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Ligne 3 : Budget par domaine ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Budget par domaine */}
        <div style={cardStyle}>
          <div style={titleStyle}>💰 Budget investi par domaine (DT)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetParDomaine()} margin={{ top: 5, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis dataKey="domaine" stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                angle={-25} textAnchor="end" interval={0} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="budget" name="Budget (DT)" radius={[4, 4, 0, 0]}>
                {budgetParDomaine().map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tableau résumé dernières formations */}
        <div style={cardStyle}>
          <div style={titleStyle}>📋 Dernières formations ajoutées</div>
          <div style={{ overflowY: 'auto', maxHeight: 240 }}>
            {[...formations].reverse().slice(0, 6).map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#f1f0ff', marginBottom: 2 }}>
                    {f.titre.length > 28 ? f.titre.substring(0, 28) + '...' : f.titre}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(139,92,246,0.7)' }}>{f.annee} — {f.duree}j</div>
                </div>
                <span style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {f.participants?.length || 0} inscrits
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Indicateurs synthèse ── */}
      <div style={cardStyle}>
        <div style={titleStyle}>📊 Indicateurs de synthèse</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            {
              label: 'Durée moyenne formation',
              value: formations.length > 0
                ? (formations.reduce((s, f) => s + f.duree, 0) / formations.length).toFixed(1) + ' jours'
                : '—',
              color: '#8b5cf6'
            },
            {
              label: 'Budget moyen / formation',
              value: formations.length > 0
                ? (stats.budgetTotal / formations.length).toLocaleString('fr-TN') + ' DT'
                : '—',
              color: '#10b981'
            },
            {
              label: 'Moy. inscrits / formation',
              value: formations.length > 0
                ? (formations.reduce((s, f) => s + (f.participants?.length || 0), 0) / formations.length).toFixed(1)
                : '—',
              color: '#f59e0b'
            },
            {
              label: 'Taux de couverture',
              value: participants.length > 0
                ? ((formations.reduce((s, f) => s + (f.participants?.length || 0), 0) / participants.length) * 100).toFixed(0) + '%'
                : '—',
              color: '#ec4899'
            },
          ].map(ind => (
            <div key={ind.label} style={{ background: '#0d0d1a', borderRadius: 10, padding: '16px', border: `1px solid ${ind.color}22` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: ind.color, marginBottom: 6 }}>{ind.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{ind.label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;