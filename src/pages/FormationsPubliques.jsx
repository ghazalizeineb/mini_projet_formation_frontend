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

    useEffect(() => {
        fetchData();
    }, []);

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
            // Pas connecté → afficher modal choix
            setSelectedFormation(formation);
            setShowModal(true);
        } else {
            // Connecté → aller vers page utilisateur
            if (user.role === 'SIMPLE_UTILISATEUR') {
                navigate('/utilisateur/formations');
            } else if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/responsable');
            }
        }
    };

    const filteredFormations = formations.filter(f => {
        const matchSearch = f.titre.toLowerCase().includes(search.toLowerCase());
        const matchDomaine = filterDomaine === '' || f.domaine?.id === parseInt(filterDomaine);
        return matchSearch && matchDomaine;
    });

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            {/* Navbar publique */}
            <nav className="navbar navbar-expand-lg navbar-dark"
                style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                <div className="container">
                    <span className="navbar-brand fw-bold">🎓 Excellent Training</span>
                    <div className="ms-auto d-flex gap-2">
                        {isConnected ? (
                            <>
                                <span className="text-white align-self-center me-2">
                                    👤 {user.login}
                                </span>
                                <button className="btn btn-outline-light btn-sm"
                                    onClick={() => {
                                        if (user.role === 'ADMIN') navigate('/admin');
                                        else if (user.role === 'RESPONSABLE') navigate('/responsable');
                                        else navigate('/utilisateur');
                                    }}>
                                    Mon espace
                                </button>
                                <button className="btn btn-outline-danger btn-sm"
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('user');
                                        window.location.reload();
                                    }}>
                                    🚪 Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-outline-light btn-sm"
                                    onClick={() => navigate('/login')}>
                                    🔐 Connexion
                                </button>
                                <button className="btn btn-primary btn-sm"
                                    onClick={() => navigate('/register')}>
                                    ✅ Créer un compte
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="text-white text-center py-5"
                style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                <h1 className="fw-bold">🎓 Nos Formations</h1>
                <p className="lead">Découvrez toutes nos formations et inscrivez-vous</p>
                <div className="d-flex justify-content-center gap-3">
                    <div className="bg-white bg-opacity-10 rounded px-4 py-2">
                        <h3 className="mb-0">{formations.length}</h3>
                        <small>Formations</small>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded px-4 py-2">
                        <h3 className="mb-0">{domaines.length}</h3>
                        <small>Domaines</small>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                {/* Filtres */}
                <div className="card mb-4 shadow-sm border-0">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-8">
                                <div className="input-group">
                                    <span className="input-group-text">🔍</span>
                                    <input type="text" className="form-control"
                                        placeholder="Rechercher une formation..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <select className="form-select" value={filterDomaine}
                                    onChange={(e) => setFilterDomaine(e.target.value)}>
                                    <option value="">🌐 Tous les domaines</option>
                                    {domaines.map(d => (
                                        <option key={d.id} value={d.id}>{d.libelle}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formations */}
                {loading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary"></div>
                        <p className="mt-2">Chargement...</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredFormations.map((f) => (
                            <div key={f.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm border-0"
                                    style={{ borderRadius: 12, overflow: 'hidden' }}>
                                    <div className="card-header border-0 text-white py-3"
                                        style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                                        <h6 className="mb-0 fw-bold">{f.titre}</h6>
                                        <small className="opacity-75">📚 {f.domaine?.libelle}</small>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <div className="bg-light rounded p-2 text-center">
                                                    <div className="fw-bold text-primary">{f.annee}</div>
                                                    <small className="text-muted">Année</small>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="bg-light rounded p-2 text-center">
                                                    <div className="fw-bold text-success">{f.duree}j</div>
                                                    <small className="text-muted">Durée</small>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="bg-light rounded p-2 text-center">
                                                    <div className="fw-bold text-warning">{f.budget} DT</div>
                                                    <small className="text-muted">Budget</small>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="bg-light rounded p-2 text-center">
                                                    <div className="fw-bold text-info">
                                                        {f.participants?.length || 0}
                                                    </div>
                                                    <small className="text-muted">Inscrits</small>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-muted small mb-0">
                                            🧑‍🏫 {f.formateur?.nom} {f.formateur?.prenom}
                                        </p>
                                    </div>
                                    <div className="card-footer border-0 bg-white">
                                        <button
                                            className="btn btn-primary w-100 btn-sm"
                                            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                                            onClick={() => handleClickInscrire(f)}
                                        >
                                            ✅ S'inscrire
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredFormations.length === 0 && (
                            <div className="text-center mt-5">
                                <div style={{ fontSize: 60 }}>🔍</div>
                                <h4 className="text-muted">Aucune formation trouvée</h4>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal : pas connecté */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0"
                                style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                                <h5 className="modal-title text-white">
                                    🔐 Connexion requise
                                </h5>
                                <button className="btn-close btn-close-white"
                                    onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <div style={{ fontSize: 60 }}>🎓</div>
                                <h5 className="mt-3">
                                    Pour vous inscrire à <strong>"{selectedFormation?.titre}"</strong>
                                </h5>
                                <p className="text-muted">
                                    Vous devez avoir un compte pour vous inscrire à cette formation.
                                </p>
                                <div className="d-flex gap-3 justify-content-center mt-4">
                                    <button
                                        className="btn btn-primary px-4"
                                        onClick={() => {
                                            setShowModal(false);
                                            navigate('/login', {
                                                state: { fromFormation: selectedFormation?.id }
                                            });
                                        }}>
                                        🔐 Se connecter
                                    </button>
                                    <button
                                        className="btn btn-success px-4"
                                        onClick={() => {
                                            setShowModal(false);
                                            navigate('/register', {
                                                state: { fromFormation: selectedFormation?.id }
                                            });
                                        }}>
                                        ✅ Créer un compte
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormationsPubliques;