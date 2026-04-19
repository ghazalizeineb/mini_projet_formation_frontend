import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

function Login({ onLogin }) {
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        login: res.data.login,
        role: res.data.role
      }));
      onLogin(res.data);
    } catch {
      setError('Login ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

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
            background: '#6378ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 22, color: '#fff', fontWeight: 500
          }}>G</div>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#fff', marginBottom: 6 }}>
            Gestion Formation
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

            {/* Identifiant */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 7, fontWeight: 500 }}>
                Identifiant
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '0.5px solid #e5e7eb',
                borderRadius: 8,
                background: '#f9fafb',
                padding: '0 12px',
                height: 42, gap: 10,
                transition: 'border 0.15s'
              }}>
                <span style={{ fontSize: 15, color: '#9ca3af' }}>@</span>
                <input
                  type="text"
                  placeholder="Votre identifiant"
                  value={form.login}
                  onChange={e => setForm({ ...form, login: e.target.value })}
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

            {/* Mot de passe */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 7, fontWeight: 500 }}>
                Mot de passe
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '0.5px solid #e5e7eb',
                borderRadius: 8,
                background: '#f9fafb',
                padding: '0 12px',
                height: 42, gap: 10
              }}>
                <span style={{ fontSize: 15, color: '#9ca3af' }}>🔒</span>
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#6378ff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '11px',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s'
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
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

          {/* Lien register */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            Pas de compte ?{' '}
            <Link to="/register" style={{
              color: '#6378ff',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;