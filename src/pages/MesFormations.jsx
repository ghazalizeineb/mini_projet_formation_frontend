import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

function MesFormations() {
  const [formations, setFormations] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [myParticipant, setMyParticipant] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formationToInscrire, setFormationToInscrire] = useState(null);
  const [formParticipant, setFormParticipant] = useState({
    nom: '', prenom: '', email: '', tel: '',
    structure: { id: '' }, profil: { id: '' }
  });
  const [structures, setStructures] = useState([]);
  const [profils, setProfils] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const inscriptionId = location.state?.inscriptionFormationId;
    if (inscriptionId && formations.length > 0) {
      const formation = formations.find(f => f.id === inscriptionId);
      if (formation) handleClickInscrire(formation);
    }
  }, [formations, location.state]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [formRes, partRes, domRes, strRes, proRes] = await Promise.all([
        api.get('/formations'),
        api.get('/participants'),
        api.get('/domaines'),
        api.get('/structures'),
        api.get('/profils'),
      ]);
      setFormations(formRes.data);
      setDomaines(domRes.data);
      setStructures(strRes.data);
      setProfils(proRes.data);
      const me = partRes.data.find(p =>
        p.email?.toLowerCase() === user?.login?.toLowerCase()
      );
      if (me) setMyParticipant(me);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isInscrit = (f) =>
    myParticipant && f.participants?.some(p => p.id === myParticipant.id);

  const handleClickInscrire = (formation) => {
    setFormationToInscrire(formation);
    setErrorModal('');
    if (myParticipant) {
      setFormParticipant({
        nom: myParticipant.nom || '',
        prenom: myParticipant.prenom || '',
        email: myParticipant.email || user?.login || '',
        tel: myParticipant.tel || '',
        structure: { id: myParticipant.structure?.id || '' },
        profil: { id: myParticipant.profil?.id || '' }
      });
    } else {
      setFormParticipant({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.login || '',
        tel: '',
        structure: { id: '' },
        profil: { id: '' }
      });
    }
    setShowModal(true);
  };

  const handleValiderProfil = async (e) => {
    e.preventDefault();
    setErrorModal('');
    if (!formParticipant.nom.trim()) return setErrorModal('Le nom est obligatoire');
    if (!formParticipant.prenom.trim()) return setErrorModal('Le prénom est obligatoire');
    if (!formParticipant.email.trim()) return setErrorModal("L'email est obligatoire");
    if (!formParticipant.tel.trim()) return setErrorModal('Le téléphone est obligatoire');
    if (!formParticipant.structure.id) return setErrorModal('Veuillez choisir une structure');
    if (!formParticipant.profil.id) return setErrorModal('Veuillez choisir un profil');

    setSaving(true);
    try {
      const payload = {
        nom: formParticipant.nom,
        prenom: formParticipant.prenom,
        email: formParticipant.email,
        tel: formParticipant.tel,
        structure: { id: parseInt(formParticipant.structure.id) },
        profil: { id: parseInt(formParticipant.profil.id) },
      };

      let participantId;
      if (myParticipant) {
        const res = await api.put(`/participants/${myParticipant.id}`, payload);
        setMyParticipant(res.data);
        participantId = myParticipant.id;
      } else {
        const res = await api.post('/participants', payload);
        setMyParticipant(res.data);
        participantId = res.data.id;
      }

      await api.post(`/formations/${formationToInscrire.id}/participants/${participantId}`);
      setMessage('Inscription réussie !');
      setShowModal(false);
      fetchAll();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setErrorModal("Erreur lors de l'inscription. Vous êtes peut-être déjà inscrit.");
    } finally {
      setSaving(false);
    }
  };

  const handleDesinscrire = async (formationId) => {
    if (!window.confirm('Confirmer la désinscription ?')) return;
    try {
      await api.delete(`/formations/${formationId}/participants/${myParticipant.id}`);
      setMessage('Désinscription réussie !');
      fetchAll();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Erreur lors de la désinscription.');
    }
  };

  const filteredFormations = formations.filter(f => {
    const matchSearch = f.titre.toLowerCase().includes(search.toLowerCase());
    const matchDomaine = filterDomaine === '' || f.domaine?.id === parseInt(filterDomaine);
    return matchSearch && matchDomaine;
  });

  const inscritesCount = formations.filter(f => isInscrit(f)).length;

  const domaineBadge = (libelle) => {
    const map = {
      'Informatique': { bg: 'rgba(139,92,246,0.15)', color: '#c4b5fd', dot: '#a78bfa' },
      'Finance':      { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', dot: '#fb923c' },
      'Management':   { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', dot: '#34d399' },
      'Comptabilité': { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', dot: '#8b5cf6' },
      'Mécanique':    { bg: 'rgba(244,63,94,0.12)',   color: '#fb7185', dot: '#f43f5e' },
    };
    return map[libelle] || { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', dot: '#64748b' };
  };

  const inputStyle = {
    width: '100%', height: 42,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: 10, padding: '0 14px',
    fontSize: 13, color: '#ede9fe', outline: 'none',
    fontFamily: "'Inter', sans-serif",
  };

  const labelStyle = {
    fontSize: 10, color: '#6d5a99',
    marginBottom: 6, display: 'block',
    textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ fontFamily: "'Syne', 'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        .mf-card {
          background: #1a0f35;
          border: 1px solid rgba(167,139,250,0.12);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.15s;
          position: relative;
        }
        .mf-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent);
        }
        .mf-card:hover { border-color: rgba(139,92,246,0.35); transform: translateY(-2px); }
        .mf-card.inscrit { border-color: rgba(52,211,153,0.25); }
        .mf-card.inscrit::before { background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent); }

        .btn-inscrire {
          width: 100%;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.3);
          color: #c4b5fd;
          border-radius: 10px; padding: 10px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .btn-inscrire:hover { background: rgba(124,58,237,0.28); }

        .btn-desinscrire {
          width: 100%;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          border-radius: 10px; padding: 10px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }
        .btn-desinscrire:hover { background: rgba(239,68,68,0.15); }

        .mf-input:focus { border-color: rgba(139,92,246,0.5) !important; }
        .mf-input::placeholder { color: #3d3259; }
        select.mf-input option { background: #1a0f35; color: #ede9fe; }

        .mf-search::placeholder { color: #4a3d6b; }
        select.mf-domain option { background: #1a0f35; color: #ede9fe; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 700, color: '#ede9fe',
          marginBottom: 6, fontFamily: "'Syne', sans-serif", letterSpacing: -0.5,
        }}>
          Formations disponibles
        </h1>
        <p style={{ fontSize: 13, color: '#6d5a99', fontFamily: "'Inter', sans-serif" }}>
          Bonjour{' '}
          <span style={{ color: '#c4b5fd', fontWeight: 600 }}>
            {user?.nom} {user?.prenom}
          </span>
          {' '}— inscrivez-vous aux formations qui vous intéressent
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          {
            label: 'Formations disponibles',
            value: formations.length,
            color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)',
          },
          {
            label: 'Mes inscriptions',
            value: inscritesCount,
            color: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.2)',
          },
          {
            label: myParticipant ? `${myParticipant.nom} ${myParticipant.prenom}` : 'Profil incomplet',
            value: myParticipant ? '✓' : '!',
            color: myParticipant ? '#34d399' : '#fb7185',
            bg: myParticipant ? 'rgba(52,211,153,0.10)' : 'rgba(244,63,94,0.10)',
            border: myParticipant ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)',
          },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#1a0f35',
            border: `1px solid ${s.border}`,
            borderRadius: 14, padding: '18px 20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${s.color}66, transparent)`,
            }} />
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            </div>
            <div style={{
              fontSize: 26, fontWeight: 700, color: '#ede9fe',
              fontFamily: "'Syne', sans-serif", letterSpacing: -1,
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 11, color: '#6d5a99', marginTop: 3,
              fontFamily: "'Inter', sans-serif", fontWeight: 400,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Message ── */}
      {message && (
        <div style={{
          background: message.includes('Erreur') ? 'rgba(244,63,94,0.08)' : 'rgba(52,211,153,0.08)',
          border: `1px solid ${message.includes('Erreur') ? 'rgba(244,63,94,0.25)' : 'rgba(52,211,153,0.25)'}`,
          borderRadius: 10, padding: '10px 16px',
          fontSize: 13, fontFamily: "'Inter', sans-serif",
          color: message.includes('Erreur') ? '#fb7185' : '#34d399',
          marginBottom: 20,
        }}>
          {message}
        </div>
      )}

      {/* ── Filtres ── */}
      <div style={{
        background: '#1a0f35',
        border: '1px solid rgba(167,139,250,0.12)',
        borderRadius: 14, padding: '14px 16px',
        marginBottom: 24, display: 'flex', gap: 12,
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a3d6b" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mf-search"
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <select
          value={filterDomaine}
          onChange={e => setFilterDomaine(e.target.value)}
          className="mf-domain"
          style={{ ...inputStyle, width: 220 }}
        >
          <option value="">Tous les domaines</option>
          {domaines.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
        </select>
      </div>

      {/* Compteur */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: '#6d5a99', fontFamily: "'Inter', sans-serif" }}>
          <strong style={{ color: '#a78bfa', fontWeight: 500 }}>{filteredFormations.length}</strong>
          {' '}formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Grille formations ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 34, height: 34,
            border: '3px solid rgba(167,139,250,0.15)',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#6d5a99', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
            Chargement des formations...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredFormations.map(f => {
            const inscrit = isInscrit(f);
            const badge = domaineBadge(f.domaine?.libelle);
            return (
              <div key={f.id} className={`mf-card${inscrit ? ' inscrit' : ''}`}>

                {/* Card header */}
                <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid rgba(167,139,250,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: badge.bg, color: badge.color,
                      fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                      textTransform: 'uppercase', letterSpacing: '0.7px',
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: badge.dot }} />
                      {f.domaine?.libelle || 'Non défini'}
                    </span>
                    {inscrit && (
                      <span style={{
                        background: 'rgba(52,211,153,0.12)', color: '#34d399',
                        fontSize: 10, fontWeight: 600, padding: '3px 10px',
                        borderRadius: 6, fontFamily: "'Inter', sans-serif",
                        border: '1px solid rgba(52,211,153,0.2)',
                      }}>
                        ✓ Inscrit
                      </span>
                    )}
                  </div>
                  <h3 style={{
                    fontSize: 15, fontWeight: 600, color: '#ede9fe',
                    margin: 0, lineHeight: 1.35, fontFamily: "'Syne', sans-serif",
                  }}>
                    {f.titre}
                  </h3>
                </div>

                {/* Card body */}
                <div style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Année',    value: f.annee },
                      { label: 'Durée',    value: `${f.duree} jours` },
                      { label: 'Budget',   value: `${f.budget?.toLocaleString()} DT` },
                      { label: 'Inscrits', value: `${f.participants?.length || 0} pers.` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(167,139,250,0.07)',
                        borderRadius: 8, padding: '8px 10px',
                      }}>
                        <div style={{
                          fontSize: 10, color: '#4a3d6b', marginBottom: 2,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {label}
                        </div>
                        <div style={{
                          fontSize: 13, fontWeight: 500, color: '#ddd6fe',
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    fontSize: 12, color: '#4a3d6b', marginBottom: 12,
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    Formateur :{' '}
                    <span style={{ color: '#9d8cba' }}>
                      {f.formateur ? `${f.formateur.nom} ${f.formateur.prenom}` : '—'}
                    </span>
                  </div>

                  {inscrit ? (
                    <button className="btn-desinscrire" onClick={() => handleDesinscrire(f.id)}>
                      Se désinscrire
                    </button>
                  ) : (
                    <button className="btn-inscrire" onClick={() => handleClickInscrire(f)}>
                      S'inscrire →
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredFormations.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                width: 50, height: 50, background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <p style={{ color: '#6d5a99', fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
                Aucune formation trouvée
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Modal inscription ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,4,22,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#1a0f35',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 18, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
            {/* Filet lumineux */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
            }} />

            {/* Modal header */}
            <div style={{
              padding: '22px 24px 18px',
              borderBottom: '1px solid rgba(167,139,250,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <h3 style={{
                  fontSize: 17, fontWeight: 700, color: '#ede9fe',
                  marginBottom: 4, fontFamily: "'Syne', sans-serif",
                }}>
                  Formulaire d'inscription
                </h3>
                <p style={{ fontSize: 12, color: '#7c3aed', fontFamily: "'Inter', sans-serif" }}>
                  {formationToInscrire?.titre}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: 8, width: 32, height: 32,
                  cursor: 'pointer', fontSize: 16, color: '#fb7185',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                ×
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 24px' }}>
              {errorModal && (
                <div style={{
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: 13, color: '#fb7185',
                  marginBottom: 16, fontFamily: "'Inter', sans-serif",
                }}>
                  ⚠ {errorModal}
                </div>
              )}

              <form onSubmit={handleValiderProfil}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Nom *</label>
                    <input
                      className="mf-input"
                      style={inputStyle} type="text" placeholder="Votre nom"
                      value={formParticipant.nom}
                      onChange={e => setFormParticipant({ ...formParticipant, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Prénom *</label>
                    <input
                      className="mf-input"
                      style={inputStyle} type="text" placeholder="Votre prénom"
                      value={formParticipant.prenom}
                      onChange={e => setFormParticipant({ ...formParticipant, prenom: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email *</label>
                  <input
                    className="mf-input"
                    style={inputStyle} type="email" placeholder="Votre email"
                    value={formParticipant.email}
                    onChange={e => setFormParticipant({ ...formParticipant, email: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Téléphone *</label>
                  <input
                    className="mf-input"
                    style={inputStyle} type="text" placeholder="Ex: 22 000 000"
                    value={formParticipant.tel}
                    onChange={e => setFormParticipant({ ...formParticipant, tel: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                  <div>
                    <label style={labelStyle}>Structure *</label>
                    <select
                      className="mf-input"
                      style={inputStyle}
                      value={formParticipant.structure.id}
                      onChange={e => setFormParticipant({ ...formParticipant, structure: { id: e.target.value } })}>
                      <option value="">-- Choisir --</option>
                      {structures.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Profil *</label>
                    <select
                      className="mf-input"
                      style={inputStyle}
                      value={formParticipant.profil.id}
                      onChange={e => setFormParticipant({ ...formParticipant, profil: { id: e.target.value } })}>
                      <option value="">-- Choisir --</option>
                      {profils.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%', height: 46,
                    background: saving ? 'rgba(124,58,237,0.3)' : '#7c3aed',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 14, fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background 0.15s',
                  }}>
                  {saving ? 'Inscription en cours...' : "Confirmer l'inscription"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesFormations;