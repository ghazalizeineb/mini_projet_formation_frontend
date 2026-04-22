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

  const wrapStyle = {
    display: 'flex', alignItems: 'center',
    border: '0.5px solid #e5e7eb', borderRadius: 8,
    background: '#f9fafb', padding: '0 12px', height: 42, gap: 10
  };
  const inputStyle = {
    flex: 1, border: 'none', background: 'transparent',
    outline: 'none', fontSize: 14, color: '#111827'
  };
  const labelStyle = {
    fontSize: 12, color: '#6b7280',
    marginBottom: 7, fontWeight: 500, display: 'block'
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f4f5f7',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        width: 420, background: '#fff', borderRadius: 16,
        border: '0.5px solid #e5e7eb', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
      }}>
        {/* Header */}
        <div style={{ background: '#1a1f2e', padding: '32px 24px 24px', textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#1D9E75',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 20, color: '#fff', fontWeight: 500
          }}>G</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>
            Créer un compte
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Excellent Training — ISI Tunis
          </div>
          {fromFormation && (
            <div style={{
              marginTop: 12, background: 'rgba(29,158,117,0.2)',
              borderRadius: 8, padding: '8px 12px',
              fontSize: 12, color: '#6ee7b7'
            }}>
              Créez votre compte pour finaliser votre inscription
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#fcebeb', border: '0.5px solid #f09595',
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
              color: '#a32d2d', marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nom + Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Nom</label>
                <div style={wrapStyle}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>👤</span>
                  <input type="text" placeholder="Votre nom"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    required style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Prénom</label>
                <div style={wrapStyle}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>👤</span>
                  <input type="text" placeholder="Votre prénom"
                    value={form.prenom}
                    onChange={e => setForm({ ...form, prenom: e.target.value })}
                    required style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Login */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Identifiant</label>
              <div style={wrapStyle}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>@</span>
                <input type="text" placeholder="Choisissez un identifiant"
                  value={form.login}
                  onChange={e => setForm({ ...form, login: e.target.value })}
                  required style={inputStyle} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Mot de passe</label>
              <div style={wrapStyle}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>🔒</span>
                <input type="password" placeholder="Min. 6 caractères"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={inputStyle} />
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <div style={wrapStyle}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>🔒</span>
                <input type="password" placeholder="Répétez votre mot de passe"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required style={inputStyle} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#9ca3af' : '#1D9E75',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '11px', fontSize: 14, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>ou</span>
            <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            Déjà un compte ?{' '}
            <Link to="/login" state={{ fromFormation }}
              style={{ color: '#6378ff', textDecoration: 'none', fontWeight: 500 }}>
              Se connecter
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 12 }}>
              Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;