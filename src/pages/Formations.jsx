import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function Formations() {
  const [formations, setFormations] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState({
    titre: '', annee: '', duree: '', budget: '',
    domaineId: '', formateurId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');

  useEffect(() => {
    fetchFormations();
    fetchDomaines();
    fetchFormateurs();
    fetchParticipants();
  }, []);

  const fetchFormations = async () => {
    try {
      const res = await api.get('/formations');
      setFormations(res.data);
    } catch (error) {
      console.error("Erreur chargement formations", error);
    }
  };

  const fetchDomaines = async () => {
    try {
      const res = await api.get('/domaines');
      setDomaines(res.data);
    } catch (error) {
      console.error("Erreur chargement domaines", error);
    }
  };

  const fetchFormateurs = async () => {
    try {
      const res = await api.get('/formateurs');
      setFormateurs(res.data);
    } catch (error) {
      console.error("Erreur chargement formateurs", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await api.get('/participants');
      setParticipants(res.data);
    } catch (error) {
      console.error("Erreur chargement participants", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        titre: form.titre,
        annee: parseInt(form.annee),
        duree: parseInt(form.duree),
        budget: parseFloat(form.budget),
        domaineId: parseInt(form.domaineId),
        formateurId: parseInt(form.formateurId)
      };
      if (editingId) {
        await api.put(`/formations/${editingId}`, payload);
        setMessage('✅ Formation modifiée avec succès !');
        setEditingId(null);
      } else {
        await api.post('/formations', payload);
        setMessage('✅ Formation ajoutée avec succès !');
      }
      setForm({ titre: '', annee: '', duree: '', budget: '', domaineId: '', formateurId: '' });
      fetchFormations();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement !');
    }
  };

  const handleEdit = (formation) => {
    setForm({
      titre: formation.titre,
      annee: formation.annee,
      duree: formation.duree,
      budget: formation.budget,
      domaineId: formation.domaine?.id || '',
      formateurId: formation.formateur?.id || ''
    });
    setEditingId(formation.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette formation ?')) {
      try {
        await api.delete(`/formations/${id}`);
        setMessage('✅ Formation supprimée avec succès !');
        fetchFormations();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Erreur lors de la suppression !');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ titre: '', annee: '', duree: '', budget: '', domaineId: '', formateurId: '' });
  };

  const handleShowParticipants = (formation) => {
    setSelectedFormation(formation);
    setShowParticipants(true);
  };

  const handleAjouterParticipant = async () => {
    if (!selectedParticipantId) return;
    try {
      await api.post(`/formations/${selectedFormation.id}/participants/${selectedParticipantId}`);
      setMessage('✅ Participant ajouté à la formation !');
      fetchFormations();
      const res = await api.get('/formations');
      const updated = res.data.find(f => f.id === selectedFormation.id);
      setSelectedFormation(updated);
      setSelectedParticipantId('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'ajout du participant !');
    }
  };

  const handleRetirerParticipant = async (participantId) => {
    try {
      await api.delete(`/formations/${selectedFormation.id}/participants/${participantId}`);
      setMessage('✅ Participant retiré de la formation !');
      fetchFormations();
      const res = await api.get('/formations');
      const updated = res.data.find(f => f.id === selectedFormation.id);
      setSelectedFormation(updated);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors du retrait du participant !');
    }
  };

  return (
    <div>
      <h2 className="mb-4">Gestion des Formations</h2>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Formulaire */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>{editingId ? ' Modifier une formation' : '   Ajouter une formation'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Titre de la formation"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Année"
                  value={form.annee}
                  onChange={(e) => setForm({ ...form, annee: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Durée (jours)"
                  value={form.duree}
                  onChange={(e) => setForm({ ...form, duree: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Budget (DT)"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  required
                />
              </div>
             <div className="col-md-4">
  <select
    className="form-control"
    value={form.domaineId}
    onChange={(e) => setForm({ ...form, domaineId: e.target.value })}
    required
  >
    <option value="">Choisir un domaine</option>
    {domaines.map((d) => (
      <option key={d.id} value={d.id}>{d.libelle}</option>
    ))}
  </select>
</div>
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={form.formateurId}
                  onChange={(e) => setForm({ ...form, formateurId: e.target.value })}
                  required
                >
                  <option value="">Choisir un formateur</option>
                  {formateurs.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom} {f.prenom}</option>
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

      {/* Tableau formations */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Liste des Formations ({formations.length})</h5>
        </div>
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead className="table-secondary">
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Année</th>
                <th>Durée (j)</th>
                <th>Budget (DT)</th>
                <th>Domaine</th>
                <th>Formateur</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formations.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.titre}</td>
                  <td>{f.annee}</td>
                  <td>{f.duree}</td>
                  <td>{f.budget}</td>
                  <td>{f.domaine?.libelle}</td>
                  <td>{f.formateur?.nom} {f.formateur?.prenom}</td>
                  <td>
                    <button
className="btn btn-sm"
style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}                onClick={() => handleShowParticipants(f)}
                    >
                      👥 {f.participants?.length || 0}
                    </button>
                  </td>
                  <td>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
  <button
    className="btn btn-sm"
    style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
    onClick={() => handleEdit(f)}
  >
    Modifier
  </button>
  <button
    className="btn btn-sm"
    style={{ background: 'rgba(139,92,246,0.4)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
    onClick={() => handleDelete(f.id)}
  >
    Retirer
  </button>
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {formations.length === 0 && (
            <p className="text-center text-muted">Aucune formation trouvée.</p>
          )}
        </div>
      </div>

      {/* Panel participants d'une formation */}
      {showParticipants && selectedFormation && (
        <div className="card border-info">
          <div className="card-header d-flex justify-content-between"
style={{ background: 'rgba(80, 15, 193, 0.15)', color: 'black', borderBottom: '1px solid rgba(139,92,246,0.25)' }}>
            <h5> Participants — {selectedFormation.titre}</h5>
            <button className="btn btn-sm btn-light" style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }} onClick={() => setShowParticipants(false)}>
              ✖ Fermer
            </button>
          </div>
          <div className="card-body">

            {/* Ajouter participant */}
            <div className="row g-2 mb-3">
              <div className="col-md-8">
                <select
                  className="form-control "
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                >
                  <option value="">Choisir un participant à ajouter</option>
                  {participants
                    .filter(p => !selectedFormation.participants?.some(sp => sp.id === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                    ))}
                </select>
              </div>
              <div className="col-md-4">
                <button className="btn btn-success w-100" style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }} onClick={handleAjouterParticipant}>
                   Ajouter
                </button>
              </div>
            </div>

            {/* Liste participants */}
            <table className="table table-sm table-bordered">
              <thead className="table-secondary">
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedFormation.participants?.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nom}</td>
                    <td>{p.prenom}</td>
                    <td>{p.email}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRetirerParticipant(p.id)} style={{ background: 'rgba(124,58,237,0.25)', color: '#000', border: '1px solid rgba(139,92,246,0.4)' }}
                      >
                         Retirer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedFormation.participants?.length === 0 && (
              <p className="text-center text-muted">Aucun participant inscrit.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Formations;