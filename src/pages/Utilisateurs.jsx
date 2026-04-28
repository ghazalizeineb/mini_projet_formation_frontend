import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Utilisateurs() {
  const [items, setItems] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [lienForm, setLienForm] = useState({ userId: null, participantId: '' });
  const [showLien, setShowLien] = useState(false);

  useEffect(() => { fetchAll(); fetchParticipants(); fetchRoles(); }, []);

  const fetchAll = async () => {
    try { const res = await api.get('/utilisateurs'); setItems(res.data); }
    catch (e) { console.error(e); }
  };
  const fetchParticipants = async () => {
    try { const res = await api.get('/participants'); setParticipants(res.data); }
    catch (e) { console.error(e); }
  };
  const fetchRoles = async () => {
    try { const res = await api.get('/roles'); setRoles(res.data); }
    catch (e) { console.error(e); }
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try { await api.delete(`/utilisateurs/${id}`); showMsg('Utilisateur supprimé', 'success'); fetchAll(); }
    catch { showMsg('Erreur lors de la suppression', 'danger'); }
  };

  const handleLierParticipant = async () => {
    if (!lienForm.participantId) return;
    try {
      await api.put(`/utilisateurs/${lienForm.userId}/participant/${lienForm.participantId}`);
      showMsg('Participant lié avec succès', 'success');
      setShowLien(false);
      setLienForm({ userId: null, participantId: '' });
      fetchAll();
    } catch { showMsg('Erreur lors de la liaison', 'danger'); }
  };

  const roleBadge = (nom) => {
    if (nom === 'ADMIN') return 'badge-coral';
    if (nom === 'RESPONSABLE') return 'badge-purple';
    return 'badge-blue';
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Utilisateurs</h1>
      {message.text && <div className={`alert-${message.type}`}>{message.text}</div>}

      {/* Modal lier participant */}
      {showLien && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>
            Lier un participant à l'utilisateur
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="form-select" style={{ flex: 1 }}
              value={lienForm.participantId}
              onChange={e => setLienForm({ ...lienForm, participantId: e.target.value })}>
              <option value="">Choisir un participant</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.nom} {p.prenom} — {p.email}</option>
              ))}
            </select>
            <button className="btn btn-success" onClick={handleLierParticipant}>Confirmer</button>
            <button className="btn btn-secondary" onClick={() => setShowLien(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div className="page-card">
        <div className="page-card-header">
          <span className="page-card-title">Liste des utilisateurs ({items.length})</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Login</th>
              <th>Rôle</th>
              <th>Participant lié</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ color: '#9ca3af', width: 60 }}>#{item.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#6378ff22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#6378ff' }}>
                      {item.login?.substring(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{item.login}</span>
                  </div>
                </td>
                <td><span className={`badge ${roleBadge(item.role?.nom)}`}>{item.role?.nom}</span></td>
                <td>
                  {item.participant ? (
                    <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>
                      ✓ {item.participant.nom} {item.participant.prenom}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>Non lié</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {item.role?.nom === 'SIMPLE_UTILISATEUR' && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => { setLienForm({ userId: item.id, participantId: '' }); setShowLien(true); }}>
                        Lier participant
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm"style={{ background: 'rgba(124,58,237,0.25)', color: 'white', border: '1px solid rgba(139,92,246,0.4)' }} onClick={() => handleDelete(item.id)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state">Aucun utilisateur trouvé.</div>}
      </div>
    </div>
  );
}

export default Utilisateurs;