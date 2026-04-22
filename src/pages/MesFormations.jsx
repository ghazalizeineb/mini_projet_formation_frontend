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

    useEffect(() => {
        fetchAll();
    }, []);

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

    // Toujours afficher le modal - jamais inscrire directement
    const handleClickInscrire = (formation) => {
        setFormationToInscrire(formation);
        setErrorModal('');

        if (myParticipant) {
            // Profil existe → pré-remplir les champs pour que l'user confirme
            setFormParticipant({
                nom: myParticipant.nom || '',
                prenom: myParticipant.prenom || '',
                email: myParticipant.email || user?.login || '',
                tel: myParticipant.tel || '',
                structure: { id: myParticipant.structure?.id || '' },
                profil: { id: myParticipant.profil?.id || '' }
            });
        } else {
            // Pas de profil → pré-remplir avec infos du compte
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

        // Validations obligatoires
        if (!formParticipant.nom.trim()) {
            setErrorModal('❌ Le nom est obligatoire !');
            return;
        }
        if (!formParticipant.prenom.trim()) {
            setErrorModal('❌ Le prénom est obligatoire !');
            return;
        }
        if (!formParticipant.email.trim()) {
            setErrorModal('❌ L\'email est obligatoire !');
            return;
        }
        if (!formParticipant.tel.trim()) {
            setErrorModal('❌ Le numéro de téléphone est obligatoire !');
            return;
        }
        if (!formParticipant.structure.id) {
            setErrorModal('❌ Veuillez choisir une structure !');
            return;
        }
        if (!formParticipant.profil.id) {
            setErrorModal('❌ Veuillez choisir un profil !');
            return;
        }

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
                // Mettre à jour le profil existant
                const res = await api.put(`/participants/${myParticipant.id}`, payload);
                setMyParticipant(res.data);
                participantId = myParticipant.id;
            } else {
                // Créer un nouveau participant
                const res = await api.post('/participants', payload);
                setMyParticipant(res.data);
                participantId = res.data.id;
            }

            // Inscrire à la formation
            await api.post(`/formations/${formationToInscrire.id}/participants/${participantId}`);

            setMessage('✅ Inscription réussie !');
            setShowModal(false);
            fetchAll();
            setTimeout(() => setMessage(''), 3000);

        } catch (err) {
            setErrorModal('❌ Erreur lors de l\'inscription. Vous êtes peut-être déjà inscrit.');
        } finally {
            setSaving(false);
        }
    };

    const handleDesinscrire = async (formationId) => {
        if (!window.confirm('Confirmer la désinscription ?')) return;
        try {
            await api.delete(`/formations/${formationId}/participants/${myParticipant.id}`);
            setMessage('✅ Désinscription réussie !');
            fetchAll();
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage('❌ Erreur lors de la désinscription.');
        }
    };

    const filteredFormations = formations.filter(f => {
        const matchSearch = f.titre.toLowerCase().includes(search.toLowerCase());
        const matchDomaine = filterDomaine === '' || f.domaine?.id === parseInt(filterDomaine);
        return matchSearch && matchDomaine;
    });

    const inscritesCount = formations.filter(f => isInscrit(f)).length;

    const inputStyle = {
        width: '100%', border: '0.5px solid #e5e7eb', borderRadius: 8,
        padding: '10px 12px', fontSize: 14, outline: 'none', background: '#f9fafb'
    };

    return (
        <div>
            {/* Stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card text-white h-100 border-0"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12 }}>
                        <div className="card-body d-flex align-items-center gap-3">
                            <div style={{ fontSize: 40 }}>📋</div>
                            <div>
                                <h2 className="mb-0">{formations.length}</h2>
                                <p className="mb-0">Formations disponibles</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white h-100 border-0"
                        style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)', borderRadius: 12 }}>
                        <div className="card-body d-flex align-items-center gap-3">
                            <div style={{ fontSize: 40 }}>✅</div>
                            <div>
                                <h2 className="mb-0">{inscritesCount}</h2>
                                <p className="mb-0">Mes inscriptions</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white h-100 border-0"
                        style={{ background: myParticipant ? 'linear-gradient(135deg, #11998e, #38ef7d)' : 'linear-gradient(135deg, #f093fb, #f5576c)', borderRadius: 12 }}>
                        <div className="card-body d-flex align-items-center gap-3">
                            <div style={{ fontSize: 40 }}>👤</div>
                            <div>
                                <h5 className="mb-0">
                                    {myParticipant ? `${myParticipant.nom} ${myParticipant.prenom}` : 'Profil incomplet'}
                                </h5>
                                <p className="mb-0 small">
                                    {myParticipant ? 'Profil complété ✅' : 'À compléter lors de la 1ère inscription'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`alert border-0 ${message.includes('❌') ? 'alert-danger' : 'alert-success'}`}
                    style={{ borderRadius: 10 }}>
                    {message}
                </div>
            )}

            {/* Filtres */}
            <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">🔍</span>
                                <input type="text" className="form-control border-start-0"
                                    placeholder="Rechercher une formation..."
                                    value={search} onChange={(e) => setSearch(e.target.value)} />
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
                            <div className="card h-100 border-0 shadow-sm"
                                style={{ borderRadius: 12, overflow: 'hidden' }}>
                                <div className="card-header border-0 text-white py-3"
                                    style={{ background: isInscrit(f) ? 'linear-gradient(135deg, #11998e, #38ef7d)' : 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="mb-0 fw-bold">{f.titre}</h6>
                                        {isInscrit(f) && <span className="badge bg-white text-success">✅</span>}
                                    </div>
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
                                                <div className="fw-bold text-info">{f.participants?.length || 0}</div>
                                                <small className="text-muted">Inscrits</small>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-muted small mb-0">
                                        🧑‍🏫 {f.formateur?.nom} {f.formateur?.prenom}
                                    </p>
                                </div>
                                <div className="card-footer border-0 bg-white">
                                    {isInscrit(f) ? (
                                        <button className="btn btn-outline-danger w-100 btn-sm"
                                            onClick={() => handleDesinscrire(f.id)}>
                                            ❌ Se désinscrire
                                        </button>
                                    ) : (
                                        <button className="btn w-100 btn-sm text-white"
                                            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                                            onClick={() => handleClickInscrire(f)}>
                                            ✅ S'inscrire
                                        </button>
                                    )}
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

            {/* Modal formulaire inscription */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: 16 }}>
                            <div className="modal-header border-0 text-white"
                                style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '16px 16px 0 0' }}>
                                <div>
                                    <h5 className="modal-title mb-1">📝 Formulaire d'inscription</h5>
                                    <small className="opacity-75">
                                        Formation : <strong>{formationToInscrire?.titre}</strong>
                                    </small>
                                </div>
                                <button className="btn-close btn-close-white"
                                    onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">

                                {errorModal && (
                                    <div style={{
                                        background: '#fcebeb', border: '0.5px solid #f09595',
                                        borderRadius: 8, padding: '10px 14px', fontSize: 13,
                                        color: '#a32d2d', marginBottom: 16,
                                        display: 'flex', alignItems: 'center', gap: 8
                                    }}>
                                        <span>⚠</span> {errorModal}
                                    </div>
                                )}

                                <form onSubmit={handleValiderProfil}>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                                Nom *
                                            </label>
                                            <input style={inputStyle} type="text"
                                                placeholder="Votre nom"
                                                value={formParticipant.nom}
                                                onChange={e => setFormParticipant({ ...formParticipant, nom: e.target.value })} />
                                        </div>
                                        <div className="col-6">
                                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                                Prénom *
                                            </label>
                                            <input style={inputStyle} type="text"
                                                placeholder="Votre prénom"
                                                value={formParticipant.prenom}
                                                onChange={e => setFormParticipant({ ...formParticipant, prenom: e.target.value })} />
                                        </div>
                                        <div className="col-12">
                                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                                Email *
                                            </label>
                                            <input style={inputStyle} type="email"
                                                placeholder="Votre email"
                                                value={formParticipant.email}
                                                onChange={e => setFormParticipant({ ...formParticipant, email: e.target.value })} />
                                        </div>
                                        <div className="col-12">
                                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                                Téléphone *
                                            </label>
                                            <input style={inputStyle} type="text"
                                                placeholder="Ex: 22 000 000"
                                                value={formParticipant.tel}
                                                onChange={e => setFormParticipant({ ...formParticipant, tel: e.target.value })} />
                                        </div>
                                        <div className="col-6">
                                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                                Structure *
                                            </label>
                                            <select style={inputStyle}
                                                value={formParticipant.structure.id}
                                                onChange={e => setFormParticipant({ ...formParticipant, structure: { id: e.target.value } })}>
                                                <option value="">-- Choisir --</option>
                                                {structures.map(s => (
                                                    <option key={s.id} value={s.id}>{s.libelle}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                                                Profil *
                                            </label>
                                            <select style={inputStyle}
                                                value={formParticipant.profil.id}
                                                onChange={e => setFormParticipant({ ...formParticipant, profil: { id: e.target.value } })}>
                                                <option value="">-- Choisir --</option>
                                                {profils.map(p => (
                                                    <option key={p.id} value={p.id}>{p.libelle}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={saving}
                                        className="btn w-100 mt-4 text-white"
                                        style={{
                                            background: saving ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                            border: 'none', borderRadius: 8, padding: '11px',
                                            fontSize: 14, fontWeight: 500,
                                            cursor: saving ? 'not-allowed' : 'pointer'
                                        }}>
                                        {saving ? '⏳ Inscription en cours...' : '✅ Confirmer l\'inscription'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MesFormations;