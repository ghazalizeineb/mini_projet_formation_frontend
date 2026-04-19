import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Employeurs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nomEmployeur: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => { try { const res = await api.get('/employeurs'); setItems(res.data); } catch (e) { console.error(e); } };
  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/employeurs/${editingId}`, form); showMsg('Employeur modifié', 'success'); setEditingId(null); }
      else { await api.post('/employeurs', form); showMsg('Employeur ajouté', 'success'); }
      setForm({ nomEmployeur: '' }); fetchAll();
    } catch { showMsg('Erreur lors de l\'enregistrement', 'danger'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet employeur ?')) return;
    try { await api.delete(`/employeurs/${id}`); showMsg('Employeur supprimé', 'success'); fetchAll(); }
    catch { showMsg('Erreur lors de la suppression', 'danger'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Employeurs</h1>
      {message.text && <div className={`alert-${message.type}`}>{message.text}</div>}

      <div className="page-card" style={{ marginBottom: 20 }}>
        <div className="page-card-header">
          <span className="page-card-title">{editingId ? 'Modifier un employeur' : 'Ajouter un employeur'}</span>
        </div>
        <div className="page-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
            <input className="form-input" placeholder="Nom de l'employeur" value={form.nomEmployeur}
              onChange={e => setForm({ nomEmployeur: e.target.value })} required style={{ flex: 1 }} />
            <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-primary'}`}>
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ nomEmployeur: '' }); }}>Annuler</button>
            )}
          </form>
        </div>
      </div>

      <div className="page-card">
        <div className="page-card-header">
          <span className="page-card-title">Liste des employeurs ({items.length})</span>
        </div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Nom</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ color: '#9ca3af', width: 60 }}>#{item.id}</td>
                <td style={{ fontWeight: 500 }}>{item.nomEmployeur}</td>
                <td style={{ width: 120 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-warning btn-sm" onClick={() => { setForm({ nomEmployeur: item.nomEmployeur }); setEditingId(item.id); }}>Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state">Aucun employeur trouvé.</div>}
      </div>
    </div>
  );
}

export default Employeurs;