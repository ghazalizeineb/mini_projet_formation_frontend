import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Formateurs() {
  const [formateurs, setFormateurs] = useState([]);
  const [employeurs, setEmployeurs] = useState([]);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', tel: '', type: 'INTERNE', employeur: { id: '' }
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFormateurs();
    fetchEmployeurs();
  }, []);

  const fetchFormateurs = async () => {
    try {
      const res = await api.get('/formateurs');
      setFormateurs(res.data);
    } catch (error) {
      console.error("Erreur chargement formateurs", error);
    }
  };

  const fetchEmployeurs = async () => {
    try {
      const res = await api.get('/employeurs');
      setEmployeurs(res.data);
    } catch (error) {
      console.error("Erreur chargement employeurs", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        employeur: { id: parseInt(form.employeur.id) }
      };
      if (editingId) {
        await api.put(`/formateurs/${editingId}`, payload);
        setMessage('✅ Formateur modifié avec succès !');
        setEditingId(null);
      } else {
        await api.post('/formateurs', payload);
        setMessage('✅ Formateur ajouté avec succès !');
      }
      setForm({ nom: '', prenom: '', email: '', tel: '', type: 'INTERNE', employeur: { id: '' } });
      fetchFormateurs();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement !');
    }
  };

  const handleEdit = (formateur) => {
    setForm({
      nom: formateur.nom,
      prenom: formateur.prenom,
      email: formateur.email,
      tel: formateur.tel,
      type: formateur.type,
      employeur: { id: formateur.employeur?.id || '' }
    });
    setEditingId(formateur.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce formateur ?')) {
      try {
        await api.delete(`/formateurs/${id}`);
        setMessage('✅ Formateur supprimé avec succès !');
        fetchFormateurs();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Erreur lors de la suppression !');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ nom: '', prenom: '', email: '', tel: '', type: 'INTERNE', employeur: { id: '' } });
  };

  return (
    <div>
      <h2 className="mb-4">Gestion des Formateurs</h2>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Formulaire */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>{editingId ? ' Modifier un formateur' : ' Ajouter un formateur'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Prénom"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Téléphone"
                  value={form.tel}
                  onChange={(e) => setForm({ ...form, tel: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-control"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  required
                >
                  <option value="INTERNE">INTERNE</option>
                  <option value="EXTERNE">EXTERNE</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-control"
                  value={form.employeur.id}
                  onChange={(e) => setForm({ ...form, employeur: { id: e.target.value } })}
                  required
                >
                  <option value="">Choisir un employeur</option>
                  {employeurs.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nomEmployeur}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  {editingId ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
              {editingId && (
                <div className="col-md-1">
                  <button type="button" className="btn btn-primary w-100" onClick={handleCancel}>
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        <div className="card-header">
          <h5>Liste des Formateurs </h5>
        </div>
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead className="table-secondary ">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Type</th>
                <th>Employeur</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formateurs.map((formateur) => (
                <tr key={formateur.id}>
                  <td>{formateur.id}</td>
                  <td>{formateur.nom}</td>
                  <td>{formateur.prenom}</td>
                  <td>{formateur.email}</td>
                  <td>{formateur.tel}</td>
                  <td>
                      <span className={`badge ${formateur.type === 'INTERNE' ? 'bg-success' : 'bg-warning text-dark'}`} >
                        {formateur.type}
                      </span>
                  </td>
                  <td>{formateur.employeur?.nomEmployeur}</td>
                  <td>
                    <button  style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
 className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(formateur)}>
                      Modifier
                    </button>
                    <button style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
 className="btn btn-sm btn-danger" onClick={() => handleDelete(formateur.id)}>
                      Retirer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {formateurs.length === 0 && (
            <p className="text-center text-muted">Aucun formateur trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Formateurs;