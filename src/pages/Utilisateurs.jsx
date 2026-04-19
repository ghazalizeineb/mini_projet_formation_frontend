import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Utilisateurs() {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { fetchAll(); fetchRoles(); }, []);
  const fetchAll = async () => { try { const res = await api.get('/utilisateurs'); setItems(res.data); } catch (e) { console.error(e); } };
  const fetchRoles = async () => { try { const res = await api.get('/roles'); setRoles(res.data); } catch (e) { console.error(e); } };
  const showMsg = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 3000); };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try { await api.delete(`/utilisateurs/${id}`); showMsg('Utilisateur supprimé', 'success'); fetchAll(); }
    catch { showMsg('Erreur lors de la suppression', 'danger'); }
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

      <div className="page-card">
        <div className="page-card-header">
          <span className="page-card-title">Liste des utilisateurs ({items.length})</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Login</th><th>Rôle</th><th>Actions</th></tr>
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
                <td style={{ width: 100 }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Supprimer</button>
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