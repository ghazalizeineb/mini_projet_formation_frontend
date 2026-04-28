import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [structures, setStructures] = useState([]);
  const [profils, setProfils] = useState([]);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', tel: '',
    structure: { id: '' }, profil: { id: '' }
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchParticipants();
    fetchStructures();
    fetchProfils();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await api.get('/participants');
      setParticipants(res.data);
    } catch (error) {
      console.error("Erreur chargement participants", error);
    }
  };

  const fetchStructures = async () => {
    try {
      const res = await api.get('/structures');
      setStructures(res.data);
    } catch (error) {
      console.error("Erreur chargement structures", error);
    }
  };

  const fetchProfils = async () => {
    try {
      const res = await api.get('/profils');
      setProfils(res.data);
    } catch (error) {
      console.error("Erreur chargement profils", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        structure: { id: parseInt(form.structure.id) },
        profil: { id: parseInt(form.profil.id) }
      };
      if (editingId) {
        await api.put(`/participants/${editingId}`, payload);
        setMessage('✅ Participant modifié avec succès !');
        setEditingId(null);
      } else {
        await api.post('/participants', payload);
        setMessage('✅ Participant ajouté avec succès !');
      }
      setForm({ nom: '', prenom: '', email: '', tel: '', structure: { id: '' }, profil: { id: '' } });
      fetchParticipants();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement !');
    }
  };

  const handleEdit = (participant) => {
    setForm({
      nom: participant.nom,
      prenom: participant.prenom,
      email: participant.email,
      tel: participant.tel,
      structure: { id: participant.structure?.id || '' },
      profil: { id: participant.profil?.id || '' }
    });
    setEditingId(participant.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce participant ?')) {
      try {
        await api.delete(`/participants/${id}`);
        setMessage('✅ Participant supprimé avec succès !');
        fetchParticipants();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Erreur lors de la suppression !');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ nom: '', prenom: '', email: '', tel: '', structure: { id: '' }, profil: { id: '' } });
  };

  return (
    <div>
      <h2 className="mb-4"> Gestion des Participants</h2>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Formulaire */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>{editingId ? ' Modifier un participant' : ' Ajouter un participant'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Prénom"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={form.structure.id}
                  onChange={(e) => setForm({ ...form, structure: { id: e.target.value } })}
                  required
                >
                  <option value="">Choisir une structure</option>
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>{s.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={form.profil.id}
                  onChange={(e) => setForm({ ...form, profil: { id: e.target.value } })}
                  required
                >
                  <option value="">Choisir un profil</option>
                  {profils.map((p) => (
                    <option key={p.id} value={p.id}>{p.libelle}</option>
                  ))}
                </select>
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
            </div>
          </form>
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        <div className="card-header">
          <h5> Liste des Participants ({participants.length})</h5>
        </div>
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead className="table-secondary">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Structure</th>
                <th>Profil</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nom}</td>
                  <td>{p.prenom}</td>
                  <td>{p.email}</td>
                  <td>{p.tel}</td>
                  <td>{p.structure?.libelle}</td>
                  <td>{p.profil?.libelle}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2"  style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
 onClick={() => handleEdit(p)}>
                      Modifier
                    </button>
                    <button className="btn btn-sm btn-danger" style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
 onClick={() => handleDelete(p.id)}>
                      Retirer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {participants.length === 0 && (
            <p className="text-center text-muted">Aucun participant trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Participants;