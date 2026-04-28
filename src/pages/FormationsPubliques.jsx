import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPublic } from '../api/axiosConfig';

function FormationsPubliques() {
    const [formations, setFormations] = useState([]);
    const [domaines, setDomaines] = useState([]);
    const [search, setSearch] = useState('');
    const [filterDomaine, setFilterDomaine] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    const isConnected = !!token && !!user;

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [formRes, domRes] = await Promise.all([
                apiPublic.get('/formations'),
                apiPublic.get('/domaines'),
            ]);
            setFormations(formRes.data);
            setDomaines(domRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClickInscrire = (formation) => {
        if (!isConnected) {
            setSelectedFormation(formation);
            setShowModal(true);
        } else {
            if (user.role === 'SIMPLE_UTILISATEUR') navigate('/utilisateur/formations');
            else if (user.role === 'ADMIN') navigate('/admin');
            else navigate('/responsable');
        }
    };

    const filteredFormations = formations.filter(f => {
        const matchSearch = f.titre.toLowerCase().includes(search.toLowerCase());
        const matchDomaine = filterDomaine === '' || f.domaine?.id === parseInt(filterDomaine);
        return matchSearch && matchDomaine;
    });

    const domaineColor = (libelle) => {
        const map = {
            'Informatique': { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd', dot: '#a78bfa' },
            'Finance':      { bg: 'rgba(251,146,60,0.12)', text: '#fb923c', dot: '#fb923c' },
            'Management':   { bg: 'rgba(52,211,153,0.12)', text: '#34d399', dot: '#34d399' },
            'Comptabilité': { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', dot: '#8b5cf6' },
            'Mécanique':    { bg: 'rgba(244,63,94,0.12)', text: '#fb7185', dot: '#f43f5e' },
        };
        return map[libelle] || { bg: 'rgba(255,255,255,0.06)', text: '#94a3b8', dot: '#64748b' };
    };

    return (
        <div style={{ minHeight: '100vh', background: 'rgba(124,58,237,0.3)', fontFamily: "'Syne', 'Inter', sans-serif", color: '#ddd6fe' }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                select option { color: #1e293b; background: #fff; }

                .nav-btn-ghost {
                    background: transparent; color: white;
                    border: 1px solid #7c3aed ; border-radius: 8px;
                    padding: 7px 18px; font-size: 13px; font-weight: 500;
                    cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s;
                }
                .nav-btn-ghost:hover { background: rgba(139,92,246,0.12); }

                .nav-btn-fill {
                    background: #7c3aed; color: white; border: none;
                    border-radius: 100px; padding: 7px 20px; font-size: 13px;
                    font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s;
                }
                .nav-btn-fill:hover { background: #6d28d9; }

                .formation-card {
                    background: #1a0f35; border: 1px solid rgba(167,139,250,0.12);
                    border-radius: 18px; overflow: hidden;
                    transition: border-color 0.2s, transform 0.2s; position: relative;
                }
                .formation-card::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent);
                }
                .formation-card:hover { border-color: rgba(139,92,246,0.4); transform: translateY(-2px); }

                .inscrire-btn {
                    width: 100%; background: rgba(124,58,237,0.15);
                    border: 1px solid rgba(124,58,237,0.3); color: #c4b5fd;
                    border-radius: 10px; padding: 11px; font-size: 13px; font-weight: 500;
                    cursor: pointer; font-family: 'Inter', sans-serif;
                    display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s;
                }
                .inscrire-btn:hover { background: rgba(124,58,237,0.3); }

                .search-input {
                    flex: 1; border: none; outline: none; font-size: 14px;
                    color: #ddd6fe; background: transparent; font-family: 'Inter', sans-serif;
                }
                .search-input::placeholder { color: #4a3d6b; }

                .domain-select {
                    border: none; outline: none; font-size: 14px; color: #a78bfa;
                    background: transparent; cursor: pointer; min-width: 180px; font-family: 'Inter', sans-serif;
                }

                .modal-btn-primary {
                    width: 100%; background: #7c3aed; color: #fff; border: none;
                    border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600;
                    cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s;
                }
                .modal-btn-primary:hover { background: #6d28d9; }

                .modal-btn-secondary {
                    width: 100%; background: rgba(139,92,246,0.08); color: #c4b5fd;
                    border: 1px solid rgba(139,92,246,0.25); border-radius: 10px; padding: 12px;
                    font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s;
                }
                .modal-btn-secondary:hover { background: rgba(139,92,246,0.15); }
            `}</style>

            {/* ── Navbar ── */}
            <nav style={{
                background: 'rgba(18,8,42,0.97)', padding: '0 40px', height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100,
                borderBottom: '1px solid rgba(167,139,250,0.12)', backdropFilter: 'blur(12px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(139,92,246,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                    </div>
                    <span style={{ color: '#ede9fe', fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: -0.3 }}>
                        Excellent Training
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {isConnected ? (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                                borderRadius: 8, padding: '6px 12px',
                            }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: 'rgba(124,58,237,0.5)', border: '1px solid rgba(139,92,246,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, color: '#c4b5fd',
                                }}> 
                                    {user.login.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: 13, color: '#c4b5fd', fontFamily: "'Inter', sans-serif" }}>{user.login}</span>
                            </div>
                            <button className="nav-btn-fill" onClick={() => {
                                if (user.role === 'ADMIN') navigate('/admin');
                                else if (user.role === 'RESPONSABLE') navigate('/responsable');
                                else navigate('/utilisateur');
                            }}>
                                Mon espace
                            </button>
                            <button className="nav-btn-ghost" onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                window.location.reload();
                            }}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="nav-btn-ghost" onClick={() => navigate('/login')}>Connexion</button>
                            <button className="nav-btn-fill" onClick={() => navigate('/register')}>Créer un compte</button>
                        </>
                    )}
                </div>
            </nav>

            {/* ── Hero ── */}
            <div style={{ padding: '60px 40px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Orbes */}
                <div style={{
                    position: 'absolute', top: -80, right: -60, width: 420, height: 420, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(109,40,217,0.18), transparent 65%)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', top: 60, left: -100, width: 360, height: 360, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.10), transparent 65%)', pointerEvents: 'none',
                }} />
                {/* Grille décorative */}
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
                        marginBottom: 20, fontFamily: "'Inter', sans-serif",
                    }}>
                        <span style={{ display: 'block', width: 24, height: 1, background: '#7c3aed' }} />
                        Catalogue de formations 2025 / 2026
                        <span style={{ display: 'block', width: 24, height: 1, background: '#7c3aed' }} />
                    </div>

                    <h1 style={{
    fontSize: 60,
    fontWeight: 700,
    color: '#f5f3ff',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 1.15,
    fontFamily: "'Syne', sans-serif",
}}>
    Nos Formations<br />Professionnelles
</h1>
                    <p style={{
                        fontSize: 16, color: '#f5f3ff', margin: '0 auto 40px',
                        maxWidth: 480, fontWeight: 300, lineHeight: 1.7,
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        Développez vos compétences avec nos programmes de formation certifiés
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    {[
        { value: formations.length, label: 'Formations' },
        { value: domaines.length, label: 'Domaines' },
        // { value: formations.reduce((s, f) => s + (f.participants?.length || 0), 0), label: 'Participants' },
    ].map((stat, i, arr) => (
        <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: '0 32px' }}>
                <div style={{
                    fontSize: 40, fontWeight: 700, color: '#c4b5fd',
                    fontFamily: "'Syne', sans-serif", letterSpacing: -1,
                }}>
                    {stat.value}
                </div>
                <div style={{
                    fontSize: 11, color: 'white', fontWeight: 500,
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
            <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(167,139,250,0.08)', padding: '32px 40px 48px', }}>
                <div style={{ maxWidth: 1160, margin: '0 auto' }}>

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
                            <select value={filterDomaine} onChange={e => setFilterDomaine(e.target.value)} className="domain-select">
                                <option value="" >Tous les domaines</option>
                                {domaines.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Compteur */}
                    <div style={{ marginBottom: 20 }}>
                        {/* <span style={{ fontSize: 12, color: '#6d5a99', fontFamily: "'Inter', sans-serif" }}>
                            <strong style={{ color: '#a78bfa', fontWeight: 500 }}>{filteredFormations.length}</strong>
                            {' '}formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
                        </span> */}
                    </div>

                    {/* Grille */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{
                                width: 36, height: 36, border: '3px solid rgba(167,139,250,0.15)',
                                borderTopColor: '#7c3aed', borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
                            }} />
                            <p style={{ color: '#6d5a99', fontSize: 14, fontFamily: "'Inter', sans-serif" }}>Chargement des formations...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                            {filteredFormations.map(f => {
                                const badge = domaineColor(f.domaine?.libelle);
                                return (
                                    <div key={f.id} className="formation-card">
                                        {/* Header carte */}
                                        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(167,139,250,0.07)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    background: badge.bg, color: badge.text,
                                                    fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                                                    textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: "'Inter', sans-serif",
                                                }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: badge.dot }} />
                                                    {f.domaine?.libelle || 'Non défini'}
                                                </span>
                                                <span style={{
                                                    fontSize: 11, color: '#4a3d6b',
                                                    border: '1px solid rgba(167,139,250,0.1)',
                                                    borderRadius: 5, padding: '2px 8px', fontFamily: "'Inter', sans-serif",
                                                }}>
                                                    {f.annee}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ede9fe', margin: 0, lineHeight: 1.35, fontFamily: "'Syne', sans-serif" }}>
                                                {f.titre}
                                            </h3>
                                        </div>

                                        {/* Infos */}
                                        <div style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                                {[
                                                    { label: 'Durée', value: `${f.duree} jour${f.duree > 1 ? 's' : ''}` },
                                                    { label: 'Budget', value: `${f.budget?.toLocaleString()} DT` },
                                                    { label: 'Participants', value: `${f.participants?.length || 0} inscrit${(f.participants?.length || 0) > 1 ? 's' : ''}` },
                                                    { label: 'Formateur', value: f.formateur ? `${f.formateur.nom} ${f.formateur.prenom}` : '—' },
                                                ].map(item => (
                                                    <div key={item.label} style={{
                                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.07)',
                                                        borderRadius: 8, padding: '10px 12px',
                                                    }}>
                                                        <div style={{ fontSize: 10, color: '#4a3d6b', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Inter', sans-serif" }}>
                                                            {item.label}
                                                        </div>
                                                        <div style={{ fontSize: 14, fontWeight: 500, color: '#ddd6fe', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Inter', sans-serif" }}>
                                                            {item.value}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="inscrire-btn" onClick={() => handleClickInscrire(f)}>
                                                S'inscrire à cette formation
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Aucun résultat */}
                    {!loading && filteredFormations.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{
                                width: 52, height: 52, background: 'rgba(139,92,246,0.1)',
                                border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
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
            </div>

            {/* ── Modal ── */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(8,4,22,0.75)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#1a0f35', border: '1px solid rgba(139,92,246,0.25)',
                        borderRadius: 18, width: 420, overflow: 'hidden',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.5)', position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
                        }} />

                        {/* Header */}
                        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(167,139,250,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#ede9fe', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>
                                        Connexion requise
                                    </h4>
                                    <p style={{ fontSize: 13, color: '#6d5a99', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                                        Pour vous inscrire à cette formation
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)',
                                    borderRadius: 8, width: 32, height: 32,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: 18, color: '#6d5a99', lineHeight: 1,
                                }}>×</button>
                            </div>
                        </div>

                        {/* Formation sélectionnée */}
                        <div style={{ padding: '16px 24px', background: 'rgba(139,92,246,0.06)', borderBottom: '1px solid rgba(167,139,250,0.08)' }}>
                            <div style={{ fontSize: 10, color: '#4a3d6b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Inter', sans-serif" }}>
                                Formation sélectionnée
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#ede9fe', fontFamily: "'Syne', sans-serif" }}>
                                {selectedFormation?.titre}
                            </div>
                            <div style={{ fontSize: 12, color: '#6d5a99', marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
                                {selectedFormation?.domaine?.libelle} — {selectedFormation?.annee}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '20px 24px' }}>
                            <p style={{ fontSize: 13, color: '#6d5a99', marginBottom: 16, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                                Vous avez besoin d'un compte pour finaliser votre inscription.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <button className="modal-btn-primary" onClick={() => {
                                    setShowModal(false);
                                    navigate('/login', { state: { fromFormation: selectedFormation?.id } });
                                }}>
                                    Se connecter
                                </button>
                                <button className="modal-btn-secondary" onClick={() => {
                                    setShowModal(false);
                                    navigate('/register', { state: { fromFormation: selectedFormation?.id } });
                                }}>
                                    Créer un compte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormationsPubliques; 