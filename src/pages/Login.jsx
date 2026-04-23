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
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);
      if (res.data.role === 'ADMIN') window.location.href = '/admin';
      else if (res.data.role === 'RESPONSABLE') window.location.href = '/responsable';
      else window.location.href = '/utilisateur';
    } catch {
      setError('Identifiant ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, sans-serif' }}>

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
          {/* <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
            
          </div> */}
        </div>

        {/* Texte central */}
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Formation<br />
            <span style={{ color: '#ddd6fe' }}>Professionnelle</span><br />
            Continue
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 280 }}>
            Gérez vos formations, vos formateurs et vos participants depuis une plateforme centralisée.
          </p>
        </div>

        {/* Footer gauche */}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          Excellent Training — ISI Tunis © 2026
        </div>
      </div>

      {/* Partie droite — sombre */}
      <div style={{
        flex: 1, background: '#0d0d1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#f1f0ff', marginBottom: 6 }}>
              Connexion
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Excellent Training — ISI Tunis
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, color: 'rgba(139,92,246,0.8)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Identifiant
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'rgba(139,92,246,0.5)' }}>@</span>
                <input
                  type="text"
                  placeholder="Votre identifiant"
                  value={form.login}
                  onChange={e => setForm({ ...form, login: e.target.value })}
                  required
                  style={{ width: '100%', height: 44, background: '#13131f', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '0 14px 0 36px', fontSize: 13, color: '#f1f0ff', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 11, color: 'rgba(139,92,246,0.8)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(139,92,246,0.5)' }}>●</span>
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: '100%', height: 44, background: '#13131f', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '0 14px 0 36px', fontSize: 13, color: '#f1f0ff', outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: 46, background: loading ? 'rgba(139,92,246,0.4)' : '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
              Créer un compte
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
              ← Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;       