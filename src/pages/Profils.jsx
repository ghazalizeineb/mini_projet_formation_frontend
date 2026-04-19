import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Profils() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ libelle: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => { try { const res = await api.get('/profils'); setItems(res.data); } catch (e) { console.error(e); } };
  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/profils/${editingId}`, form); showMsg('Profil modifié', 'success'); setEditingId(null); }
      else { await api.post('/profils', form); showMsg('Profil ajouté', 'success'); }
      setForm({ libelle: '' }); fetchAll();
    } catch { showMsg('Erreur lors de l\'enregistrement', 'danger'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce profil ?')) return;
    try { await api.delete(`/profils/${id}`); showMsg('Profil supprimé', 'success'); fetchAll(); }
    catch { showMsg('Erreur lors de la suppression', 'danger'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Profils</h1>
      {message.text && <div className={`alert-${message.type}`}>{message.text}</div>}

      <div className="page-card" style={{ marginBottom: 20 }}>
        <div className="page-card-header">
          <span className="page-card-title">{editingId ? 'Modifier un profil' : 'Ajouter un profil'}</span>
        </div>
        <div className="page-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
            <input className="form-input" placeholder="Libellé du profil" value={form.libelle}
              onChange={e => setForm({ libelle: e.target.value })} required style={{ flex: 1 }} />
            <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-primary'}`}>
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ libelle: '' }); }}>Annuler</button>
            )}
          </form>
        </div>
      </div>

      <div className="page-card">
        <div className="page-card-header">
          <span className="page-card-title">Liste des profils ({items.length})</span>
        </div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Libellé</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ color: '#9ca3af', width: 60 }}>#{item.id}</td>
                <td style={{ fontWeight: 500 }}>{item.libelle}</td>
                <td style={{ width: 120 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-warning btn-sm" onClick={() => { setForm({ libelle: item.libelle }); setEditingId(item.id); }}>Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state">Aucun profil trouvé.</div>}
      </div>
    </div>
  );
}

export default Profils;