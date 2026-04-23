import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

function Register({ onLogin }) {
  const [form, setForm] = useState({
    nom: '', prenom: '', login: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const fromFormation = location.state?.fromFormation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword)
      return setError('Les mots de passe ne correspondent pas');
    if (form.password.length < 6)
      return setError('Le mot de passe doit contenir au moins 6 caractères');

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        nom: form.nom,
        prenom: form.prenom,
        login: form.login,
        password: form.password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);
      window.location.href = '/utilisateur';
    } catch (err) {
      setError(err.response?.data || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', height: 44,
    background: '#13131f',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 8, padding: '0 14px',
    fontSize: 13, color: '#f1f0ff', outline: 'none'
  };
  const labelStyle = {
    fontSize: 11, color: 'rgba(139,92,246,0.8)',
    marginBottom: 8, display: 'block',
    textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, sans-serif', overflowY: 'auto' }}>

      {/* Partie gauche — violette */}
      <div style={{
        width: '45%', background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Grille décorative */}
        <div style={{ position: 'absolute', bottom: 60, right: 40, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, opacity: 0.3 }}>
          {Array(36).fill(0).map((_, i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
          ))}
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
            ET
          </div>
        </div>

        {/* Texte */}
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Rejoignez<br />
            <span style={{ color: '#ddd6fe' }}>notre</span><br />
            plateforme
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 280 }}>
            Créez votre compte et accédez à toutes les formations disponibles.
          </p>
          {fromFormation && (
            <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#ddd6fe', border: '1px solid rgba(255,255,255,0.15)' }}>
              Créez votre compte pour finaliser votre inscription à la formation
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          Excellent Training — ISI Tunis © 2026
        </div>
      </div>

      {/* Partie droite — sombre */}
      <div style={{ flex: 1, background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#f1f0ff', marginBottom: 6 }}>
              Créer un compte
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Excellent Training — ISI Tunis
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Nom + Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Nom</label>
                <input type="text" placeholder="Votre nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input type="text" placeholder="Votre prénom"
                  value={form.prenom}
                  onChange={e => setForm({ ...form, prenom: e.target.value })}
                  required style={inputStyle} />
              </div>
            </div>

            {/* Identifiant */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Identifiant</label>
              <input type="text" placeholder="Choisissez un identifiant"
                value={form.login}
                onChange={e => setForm({ ...form, login: e.target.value })}
                required style={inputStyle} />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Mot de passe</label>
              <input type="password" placeholder="Min. 6 caractères"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required style={inputStyle} />
            </div>

            {/* Confirmer */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input type="password" placeholder="Répétez votre mot de passe"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', height: 46,
              background: loading ? 'rgba(16,185,129,0.4)' : '#10b981',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s'
            }}>
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" state={{ fromFormation }}
              style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
              Se connecter
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
              ← Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;