import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Structures() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ libelle: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try { const res = await api.get('/structures'); setItems(res.data); }
    catch (e) { console.error(e); }
  };

  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/structures/${editingId}`, form); showMsg('Structure modifiée avec succès', 'success'); setEditingId(null); }
      else { await api.post('/structures', form); showMsg('Structure ajoutée avec succès', 'success'); }
      setForm({ libelle: '' }); fetchAll();
    } catch { showMsg('Erreur lors de l\'enregistrement', 'danger'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette structure ?')) return;
    try { await api.delete(`/structures/${id}`); showMsg('Structure supprimée', 'success'); fetchAll(); }
    catch { showMsg('Erreur lors de la suppression', 'danger'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Structures</h1>
      {message.text && <div className={`alert-${message.type}`}>{message.text}</div>}

      <div className="page-card" style={{ marginBottom: 20 }}>
        <div className="page-card-header">
          <span className="page-card-title">{editingId ? 'Modifier une structure' : 'Ajouter une structure'}</span>
        </div>
        <div className="page-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
            <input className="form-input" placeholder="Libellé de la structure" value={form.libelle}
              onChange={e => setForm({ libelle: e.target.value })} required style={{ flex: 1 }} />
            <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-primary'}`}>
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ libelle: '' }); }}>
                Annuler
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="page-card">
        <div className="page-card-header">
          <span className="page-card-title">Liste des structures ({items.length})</span>
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
        {items.length === 0 && <div className="empty-state">Aucune structure trouvée.</div>}
      </div>
    </div>
  );
}

export default Structures;