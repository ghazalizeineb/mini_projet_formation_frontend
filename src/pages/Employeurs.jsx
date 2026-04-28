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
      if (editingId) { await api.put(`/employeurs/${editingId}`, form); showMsg('✅ Employeur modifié avec succès !', 'success'); setEditingId(null); }
      else { await api.post('/employeurs', form); showMsg('✅ Employeur ajouté avec succès !', 'success'); }
      setForm({ nomEmployeur: '' }); fetchAll();
    } catch { showMsg('❌ Erreur lors de l\'enregistrement !', 'danger'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet employeur ?')) return;
    try { await api.delete(`/employeurs/${id}`); showMsg('✅ Employeur supprimé avec succès !', 'success'); fetchAll(); }
    catch { showMsg('❌ Erreur lors de la suppression !', 'danger'); }
  };

  const handleCancel = () => { setEditingId(null); setForm({ nomEmployeur: '' }); };

  return (
    <div>
      <h2 className="mb-4">Gestion des Employeurs</h2>

      {message.text && (
        <div className={`alert ${message.type === 'danger' ? 'alert-danger' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {/* Formulaire */}
      <div className="card mb-4">
        <div className="card-header" style={{ background: 'white', color: 'black', borderBottom: '1px solid rgba(139,92,246,0.5)' }}>
          <h5>{editingId ? 'Modifier un employeur' : 'Ajouter un employeur'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Nom de l'employeur"
                value={form.nomEmployeur}
                onChange={(e) => setForm({ nomEmployeur: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                {editingId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
            {editingId && (
              <div className="col-md-2">
                <button type="button" className="btn btn-primary w-100" onClick={handleCancel}>
                  Annuler
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        <div className="card-header" style={{ background: 'white', color: 'black', borderBottom: '1px solid rgba(139,92,246,0.5)' }}>
          <h5>Liste des Employeurs ({items.length})</h5>
        </div>
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead className="table-secondary">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nomEmployeur}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
                      onClick={() => { setForm({ nomEmployeur: item.nomEmployeur }); setEditingId(item.id); }}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
                      onClick={() => handleDelete(item.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="text-center text-muted">Aucun employeur trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Employeurs;