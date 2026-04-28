import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

function Login({ onLogin }) {
  const [form, setForm] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const savedBlock = localStorage.getItem('blockedUntil');
    if (savedBlock && parseInt(savedBlock) > Date.now()) {
      setBlockedUntil(parseInt(savedBlock));
    }
    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('loginAttempts', attempts.toString());
  }, [attempts]);

  useEffect(() => {
    if (blockedUntil) {
      localStorage.setItem('blockedUntil', blockedUntil.toString());
    } else {
      localStorage.removeItem('blockedUntil');
    }
  }, [blockedUntil]);

  useEffect(() => {
    let interval;
    if (blockedUntil && blockedUntil > Date.now()) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      setCountdown(remaining);
      interval = setInterval(() => {
        const newRemaining = Math.ceil((blockedUntil - Date.now()) / 1000);
        if (newRemaining <= 0) {
          setBlockedUntil(null);
          setCountdown(0);
          setAttempts(0);
          localStorage.removeItem('blockedUntil');
          localStorage.removeItem('loginAttempts');
        } else {
          setCountdown(newRemaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [blockedUntil]);

  const isValidEmail = (email) => {
    if (!email || email.trim() === '') return false;
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (blockedUntil && blockedUntil > Date.now()) {
      const minutes = Math.ceil((blockedUntil - Date.now()) / 60000);
      setError(`⏱️ Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`);
      return;
    }

    if (!isValidEmail(form.login)) {
      setError('📧 Veuillez entrer un email valide (exemple: nom@domaine.com)');
      return;
    }

    if (!form.login || !form.password) {
      setError('⚠️ Veuillez remplir tous les champs');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);

      setAttempts(0);
      setBlockedUntil(null);
      localStorage.removeItem('blockedUntil');
      localStorage.removeItem('loginAttempts');

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);

      if (res.data.role === 'ADMIN') window.location.href = '/admin';
      else if (res.data.role === 'RESPONSABLE') window.location.href = '/responsable';
      else window.location.href = '/utilisateur';

    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (err.response?.status === 429 || newAttempts >= 5) {
        const blockTime = Date.now() + (15 * 60 * 1000);
        setBlockedUntil(blockTime);
        localStorage.setItem('blockedUntil', blockTime);
        setError('⛔ Trop de tentatives. Compte bloqué 15 minutes.');
      } else {
        const remainingAttempts = 5 - newAttempts;
        setError(`❌ Identifiant ou mot de passe incorrect. Plus que ${remainingAttempts} tentative${remainingAttempts > 1 ? 's' : ''}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{
        width: '45%', background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', bottom: 60, right: 40, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, opacity: 0.3 }}>
          {Array(36).fill(0).map((_, i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}></div>
        <div>
          <h1 style={{ fontSize: 70, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Bienvenue<br />
            <span style={{ color: '#ddd6fe' }}>sur votre</span><br />
            espace
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 280 }}>
connectez-vous pour accéder à vos formations,suivre vos inscriptions et gérer votre parcours professionnel    .      </p>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          Excellent Training — ISI Tunis © 2026
        </div>
      </div>

      <div style={{
        flex: 1, background: '#1a0f35',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 45, fontWeight: 700, color: '#f1f0ff', marginBottom: 6 }}>Connexion</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Excellent Training — ISI Tunis</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '2px solid rgba(239,68,68,0.4)',
              borderRadius: 10,
              padding: '14px 18px',
              fontSize: 14,
              color: '#fca5a5',
              marginBottom: 24,
              fontWeight: 600
            }}>
               {error}
            </div>
          )}

          {blockedUntil && blockedUntil > Date.now() && countdown > 0 && (
            <div style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 10,
              padding: '14px 18px',
              fontSize: 14,
              color: '#fbbf24',
              marginBottom: 20,
              textAlign: 'center'
            }}>
              ⏱️ Déblocage dans {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, color: 'rgba(139,92,246,0.8)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Identifiant
              </label>
              <input
                type="text"
                placeholder="Votre identifiant"
                value={form.login}
                onChange={e => setForm({ ...form, login: e.target.value })}
                required
                style={{
                  width: '100%', height: 44, background: '#13131f',
                  border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8,
                  padding: '0 14px', fontSize: 13, color: '#f1f0ff', outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 11, color: 'rgba(139,92,246,0.8)', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="Votre mot de passe"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%', height: 44, background: '#13131f',
                  border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8,
                  padding: '0 14px', fontSize: 13, color: '#f1f0ff', outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 46,
                background: loading ? 'rgba(139,92,246,0.4)' : '#8b5cf6',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
              }}
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