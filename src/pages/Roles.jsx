import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Roles() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nom: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try { const res = await api.get('/roles'); setItems(res.data); }
    catch (e) { console.error(e); }
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/roles/${editingId}`, form);
        showMsg('Rôle modifié', 'success');
        setEditingId(null);
      } else {
        await api.post('/roles', form);
        showMsg('Rôle ajouté', 'success');
      }
      setForm({ nom: '' });
      fetchAll();
    } catch { showMsg('Erreur lors de l\'enregistrement', 'danger'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce rôle ?')) return;
    try { await api.delete(`/roles/${id}`); showMsg('Rôle supprimé', 'success'); fetchAll(); }
    catch { showMsg('Erreur lors de la suppression', 'danger'); }
  };

  const roleBadge = (nom) => {
    if (nom === 'ADMIN') return { bg: '#fcebeb', color: '#a32d2d' };
    if (nom === 'RESPONSABLE') return { bg: '#eeedfe', color: '#534ab7' };
    return { bg: '#e6f1fb', color: '#185fa5' };
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20, color: '#111827' }}>Rôles</h1>

      {message.text && (
        <div style={{
          background: message.type === 'success' ? '#eaf3de' : '#fcebeb',
          border: `0.5px solid ${message.type === 'success' ? '#c0dd97' : '#f09595'}`,
          borderRadius: 8, padding: '10px 14px', fontSize: 13,
          color: message.type === 'success' ? '#3b6d11' : '#a32d2d', marginBottom: 16
        }}>
          {message.text}
        </div>
      )}

      {/* Formulaire */}
      <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
            {editingId ? 'Modifier un rôle' : 'Ajouter un rôle'}
          </span>
        </div>
        <div style={{ padding: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
            <input
              value={form.nom}
              onChange={e => setForm({ nom: e.target.value })}
              placeholder="Nom du rôle "
              required
              style={{ flex: 1, height: 38, border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '0 12px', fontSize: 13, background: '#f9fafb', color: '#111827', outline: 'none' }}
            />
            <button type="submit" style={{ height: 38, padding: '0 16px', background: editingId ? '#700bf5' : '#6378ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            {editingId && (                

              <button type="button"  onClick={() => { setEditingId(null); setForm({ nom: '' }); }}
                  style={{ height: 38, padding: '0 16px', background: '#700bf5', color: 'white', border: '0.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Annuler
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Liste des rôles ({items.length})</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ID', 'Nom', 'Actions'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', padding: '10px 16px', textAlign: 'left', borderBottom: '0.5px solid #e5e7eb', background: '#f9fafb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const badge = roleBadge(item.nom);
              return (
                <tr key={item.id} style={{ borderBottom: '0.5px solid #f3f4f6' }}>
                  <td style={{ fontSize: 13, color: '#9ca3af', padding: '11px 16px', width: 60 }}>#{item.id}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>
                      {item.nom}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', width: 150 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setForm({ nom: item.nom }); setEditingId(item.id); }}
                        style={{ height: 28, padding: '0 10px', background: 'rgba(124,58,237,0.25', color: 'black ', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        style={{ height: 28, padding: '0 10px', background: 'rgba(124,58,237,0.25', color: 'black', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: 13 }}>
            Aucun rôle trouvé.
          </div>
        )}
      </div>
    </div>
  );
}

export default Roles;