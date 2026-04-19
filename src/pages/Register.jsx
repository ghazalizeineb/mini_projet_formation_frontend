import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

function Register({ onLogin }) {
  const [form, setForm] = useState({
    login: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        login: form.login,
        password: form.password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        login: res.data.login,
        role: res.data.role
      }));
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'login',           label: 'Identifiant',              type: 'text',     icon: '@',  placeholder: 'Choisissez un identifiant' },
    { key: 'password',        label: 'Mot de passe',             type: 'password', icon: '🔒', placeholder: 'Min. 6 caractères' },
    { key: 'confirmPassword', label: 'Confirmer le mot de passe',type: 'password', icon: '🔒', placeholder: 'Répétez votre mot de passe' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 380,
        background: '#fff',
        borderRadius: 16,
        border: '0.5px solid #e5e7eb',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
      }}>

        {/* Header sombre */}
        <div style={{
          background: '#1a1f2e',
          padding: '36px 24px 28px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#1D9E75',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 22, color: '#fff', fontWeight: 500
          }}>G</div>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#fff', marginBottom: 6 }}>
            Créer un compte
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Excellent Training — ISI Tunis
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ padding: '28px 24px 24px' }}>

          {error && (
            <div style={{
              background: '#fcebeb',
              border: '0.5px solid #f09595',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: '#a32d2d',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 15 }}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map(({ key, label, type, icon, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 7, fontWeight: 500 }}>
                  {label}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  border: '0.5px solid #e5e7eb',
                  borderRadius: 8,
                  background: '#f9fafb',
                  padding: '0 12px',
                  height: 42, gap: 10
                }}>
                  <span style={{ fontSize: 15, color: '#9ca3af' }}>{icon}</span>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required
                    style={{
                      flex: 1, border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: 14,
                      color: '#111827'
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#1D9E75',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '11px',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 6,
                transition: 'background 0.15s'
              }}
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 10, margin: '18px 0'
          }}>
            <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>ou</span>
            <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
          </div>

          {/* Lien login */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            Déjà un compte ?{' '}
            <Link to="/" style={{
              color: '#6378ff',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;