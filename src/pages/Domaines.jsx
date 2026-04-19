import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Domaines() {
  const [domaines, setDomaines] = useState([]);
  const [form, setForm] = useState({ libelle: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDomaines();
  }, []);

  const fetchDomaines = async () => {
    try {
      const res = await api.get('/domaines');
      setDomaines(res.data);
    } catch (error) {
      console.error("Erreur chargement domaines", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/domaines/${editingId}`, form);
        setMessage('✅ Domaine modifié avec succès !');
        setEditingId(null);
      } else {
        await api.post('/domaines', form);
        setMessage('✅ Domaine ajouté avec succès !');
      }
      setForm({ libelle: '' });
      fetchDomaines();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement !');
    }
  };

  const handleEdit = (domaine) => {
    setForm({ libelle: domaine.libelle });
    setEditingId(domaine.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce domaine ?')) {
      try {
        await api.delete(`/domaines/${id}`);
        setMessage('✅ Domaine supprimé avec succès !');
        fetchDomaines();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Erreur lors de la suppression !');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ libelle: '' });
  };

  return (
    <div>
      <h2 className="mb-4">📚 Gestion des Domaines</h2>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Formulaire */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>{editingId ? '✏️ Modifier un domaine' : '➕ Ajouter un domaine'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Libellé du domaine"
                value={form.libelle}
                onChange={(e) => setForm({ libelle: e.target.value })}
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
                <button type="button" className="btn btn-secondary w-100" onClick={handleCancel}>
                  Annuler
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        <div className="card-header">
          <h5>📋 Liste des Domaines ({domaines.length})</h5>
        </div>
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Libellé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {domaines.map((domaine) => (
                <tr key={domaine.id}>
                  <td>{domaine.id}</td>
                  <td>{domaine.libelle}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(domaine)}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(domaine.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {domaines.length === 0 && (
            <p className="text-center text-muted">Aucun domaine trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Domaines;