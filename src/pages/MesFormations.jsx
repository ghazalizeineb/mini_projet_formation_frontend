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

  const domaineColor = (libelle) => {
    const map = {
      'Informatique': { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd', dot: '#a78bfa' },
      'Finance':      { bg: 'rgba(251,146,60,0.12)',  text: '#fb923c', dot: '#fb923c' },
      'Management':   { bg: 'rgba(52,211,153,0.12)',  text: '#34d399', dot: '#34d399' },
      'Comptabilité': { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', dot: '#8b5cf6' },
      'Mécanique':    { bg: 'rgba(244,63,94,0.12)',   text: '#fb7185', dot: '#f43f5e' },
    };
    return map[libelle] || { bg: 'rgba(255,255,255,0.06)', text: '#94a3b8', dot: '#64748b' };
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
    <div style={{ minHeight: '100vh', background: '#12082a', fontFamily: "'Syne', 'Inter', sans-serif", color: '#ddd6fe' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        select option { background: #1a0f35; color: #ede9fe; }

        .mf-card {
          background: #1a0f35;
          border: 1px solid rgba(167,139,250,0.12);
          border-radius: 18px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
          position: relative;
        }
        .mf-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent);
        }
        .mf-card:hover { border-color: rgba(139,92,246,0.4); transform: translateY(-2px); }
        .mf-card.inscrit { border-color: rgba(52,211,153,0.25); }
        .mf-card.inscrit::before { background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent); }

        .btn-inscrire {
          width: 100%;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.3);
          color: #c4b5fd;
          border-radius: 10px; padding: 11px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
        }
        .btn-inscrire:hover { background: rgba(124,58,237,0.3); }

        .btn-desinscrire {
          width: 100%;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          border-radius: 10px; padding: 11px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
        }
        .btn-desinscrire:hover { background: rgba(239,68,68,0.15); }

        .mf-input:focus { border-color: rgba(139,92,246,0.5) !important; }
        .mf-input::placeholder { color: #3d3259; }

        .search-input {
          flex: 1; border: none; outline: none; font-size: 14px;
          color: #ddd6fe; background: transparent; font-family: 'Inter', sans-serif;
        }
        .search-input::placeholder { color: #4a3d6b; }

        .domain-select {
          border: none; outline: none; font-size: 14px; color: #a78bfa;
          background: transparent; cursor: pointer; min-width: 180px;
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* ── Hero / Header ── */}
      <div style={{
        padding: '52px 40px 44px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'rgba(124,58,237,0.18)',
        borderBottom: '1px solid rgba(167,139,250,0.1)',
      }}>
        <div style={{
          position: 'absolute', top: -80, right: -60, width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.18), transparent 65%)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 40, left: -100, width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10), transparent 65%)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(167,139,250,0.06) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, color: '#a78bfa',
            textTransform: 'uppercase', letterSpacing: '2px',
            marginBottom: 18, fontFamily: "'Inter', sans-serif",
          }}>
            <span style={{ display: 'block', width: 24, height: 1, background: '#7c3aed' }} />
            Espace participant
            <span style={{ display: 'block', width: 24, height: 1, background: '#7c3aed' }} />
          </div>

          <h1 style={{
            fontSize: 46, fontWeight: 700, color: '#f5f3ff',
            marginBottom: 10, letterSpacing: -0.5, lineHeight: 1.15,
            fontFamily: "'Syne', sans-serif",
          }}>
            Formations disponibles
          </h1>

          <p style={{
            fontSize: 15, color: '#c4b5fd', margin: '0 auto 32px',
            maxWidth: 440, fontWeight: 300, lineHeight: 1.7,
            fontFamily: "'Inter', sans-serif",
          }}>
            
            <span style={{ color: '#ede9fe', fontWeight: 600 }}>
              {user?.nom} {user?.prenom}
            </span>
            {' '} Inscrivez-vous aux formations qui vous intéressent
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {[
              { value: formations.length, label: 'Formations' },
              { value: inscritesCount, label: 'Mes inscriptions' },
              {
                value: myParticipant ? '✓' : '!',
                label: myParticipant
                  ? `${myParticipant.nom} ${myParticipant.prenom}`
                  : 'Profil incomplet',
              },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0 28px' }}>
                  <div style={{
                    fontSize: 38, fontWeight: 700, color: '#c4b5fd',
                    fontFamily: "'Syne', sans-serif", letterSpacing: -1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '1.5px',
                    marginTop: 2, fontFamily: "'Inter', sans-serif",
                  }}>
                    {stat.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 1, height: 40, background: 'rgba(167,139,250,0.18)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid rgba(167,139,250,0.08)',
        padding: '32px 40px 48px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>

          {/* Message */}
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

          {/* Filtres */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: 100, padding: '10px 18px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a3d6b" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: 100, padding: '10px 18px', display: 'flex', alignItems: 'center',
            }}>
              <select
                value={filterDomaine}
                onChange={e => setFilterDomaine(e.target.value)}
                className="domain-select"
              >
                <option value="">Tous les domaines</option>
                {domaines.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
              </select>
            </div>
          </div>

          {/* Compteur */}
          {/* <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#6d5a99', fontFamily: "'Inter', sans-serif" }}>
              <strong style={{ color: '#a78bfa', fontWeight: 500 }}>{filteredFormations.length}</strong>
              {' '}formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
            </span>
          </div> */}

          {/* Grille formations */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: 36, height: 36,
                border: '3px solid rgba(167,139,250,0.15)',
                borderTopColor: '#7c3aed',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ color: '#6d5a99', fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
                Chargement des formations...
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {filteredFormations.map(f => {
                const inscrit = isInscrit(f);
                const badge = domaineColor(f.domaine?.libelle);
                return (
                  <div key={f.id} className={`mf-card${inscrit ? ' inscrit' : ''}`}>

                    {/* Card header */}
                    <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(167,139,250,0.07)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: badge.bg, color: badge.text,
                          fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                          textTransform: 'uppercase', letterSpacing: '0.8px',
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: badge.dot }} />
                          {f.domaine?.libelle || 'Non défini'}
                        </span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{
                            fontSize: 11, color: '#4a3d6b',
                            border: '1px solid rgba(167,139,250,0.1)',
                            borderRadius: 5, padding: '2px 8px',
                            fontFamily: "'Inter', sans-serif",
                          }}>
                            {f.annee}
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
                      </div>
                      <h3 style={{
                        fontSize: 16, fontWeight: 600, color: '#ede9fe',
                        margin: 0, lineHeight: 1.35, fontFamily: "'Syne', sans-serif",
                      }}>
                        {f.titre}
                      </h3>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {[
                          { label: 'Durée',     value: `${f.duree} jour${f.duree > 1 ? 's' : ''}` },
                          { label: 'Budget',    value: `${f.budget?.toLocaleString()} DT` },
                          { label: 'Inscrits',  value: `${f.participants?.length || 0} pers.` },
                          { label: 'Formateur', value: f.formateur ? `${f.formateur.nom} ${f.formateur.prenom}` : '—' },
                        ].map(({ label, value }) => (
                          <div key={label} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(167,139,250,0.07)',
                            borderRadius: 8, padding: '10px 12px',
                          }}>
                            <div style={{
                              fontSize: 10, color: '#4a3d6b', marginBottom: 3,
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                              fontFamily: "'Inter', sans-serif",
                            }}>
                              {label}
                            </div>
                            <div style={{
                              fontSize: 14, fontWeight: 500, color: '#ddd6fe',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              fontFamily: "'Inter', sans-serif",
                            }}>
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {inscrit ? (
                        <button className="btn-desinscrire" onClick={() => handleDesinscrire(f.id)}>
                          Se désinscrire
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      ) : (
                        <button className="btn-inscrire" onClick={() => handleClickInscrire(f)}>
                          S'inscrire à cette formation
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredFormations.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0' }}>
                  <div style={{
                    width: 52, height: 52, background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <h4 style={{ fontSize: 17, color: '#ede9fe', fontWeight: 600, marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>
                    Aucune formation trouvée
                  </h4>
                  <p style={{ fontSize: 13, color: '#6d5a99', fontFamily: "'Inter', sans-serif" }}>
                    Essayez de modifier votre recherche
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(167,139,250,0.15)',
                  borderRadius: 8, width: 32, height: 32,
                  cursor: 'pointer', fontSize: 18, color: '#6d5a99',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                ×
              </button>
            </div>

            {/* Formation sélectionnée */}
            <div style={{
              padding: '16px 24px',
              background: 'rgba(139,92,246,0.06)',
              borderBottom: '1px solid rgba(167,139,250,0.08)',
            }}>
              <div style={{ fontSize: 10, color: '#4a3d6b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Inter', sans-serif" }}>
                Formation sélectionnée
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ede9fe', fontFamily: "'Syne', sans-serif" }}>
                {formationToInscrire?.titre}
              </div>
              <div style={{ fontSize: 12, color: '#6d5a99', marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
                {formationToInscrire?.domaine?.libelle} — {formationToInscrire?.annee}
              </div>
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