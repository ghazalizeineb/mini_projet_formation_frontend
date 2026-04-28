import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

function Register({ onLogin }) {
  const [form, setForm] = useState({
    nom: '', prenom: '', login: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);
  
  const location = useLocation();
  const fromFormation = location.state?.fromFormation;

  // === AJOUT : Liste des emails jetables ===
  const disposableDomains = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com',
    'yopmail.com', 'throwawaymail.com', 'guerrillamail.net', 'mailnator.com',
    'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me', 'bccto.me',
    'temp-mail.org', 'jetable.org', 'spamobox.com', 'tempinbox.com'
  ];

  // === AJOUT : Gestion du compte à rebours si bloqué ===
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
        } else {
          setCountdown(newRemaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [blockedUntil]);

  // === AJOUT : Vérifier blocage persistant ===
  useEffect(() => {
    const savedBlock = localStorage.getItem('registerBlockedUntil');
    if (savedBlock && parseInt(savedBlock) > Date.now()) {
      setBlockedUntil(parseInt(savedBlock));
    }
  }, []);

  // === AJOUT : Validation email format ===
  const isValidEmail = (email) => {
    if (!email || email.trim() === '') return false;
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  // === AJOUT : Vérification email jetable ===
  const isDisposableEmail = (email) => {
    try {
      const domain = email.substring(email.indexOf('@') + 1).toLowerCase();
      return disposableDomains.includes(domain);
    } catch (e) {
      return false;
    }
  };

  // === AJOUT : Validation mot de passe FORT ===
  const checkPasswordStrength = (password) => {
    if (!password || password.length === 0) {
      setPasswordStrength({ score: 0, message: '', color: '' });
      return false;
    }
    
    let score = 0;
    let messages = [];
    
    // Longueur
    if (password.length >= 8) score++;
    else messages.push('8+ caractères');
    
    // Majuscule
    if (/[A-Z]/.test(password)) score++;
    else messages.push('1 majuscule');
    
    // Minuscule
    if (/[a-z]/.test(password)) score++;
    else messages.push('1 minuscule');
    
    // Chiffre
    if (/[0-9]/.test(password)) score++;
    else messages.push('1 chiffre');
    
    // Caractère spécial
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else messages.push('1 caractère spécial (!@#$%...)');
    
    // Interdire mots trop communs
    const lowerPwd = password.toLowerCase();
    if (lowerPwd.includes('password') || lowerPwd.includes('123456') || 
        lowerPwd.includes('azerty') || lowerPwd.includes('qwerty')) {
      score = 0;
      messages = ['Évitez les mots de passe trop communs (password, 123456, azerty)'];
    }
    
    let message = '';
    let color = '';
    
    if (score >= 5) {
      message = '✓ Mot de passe fort';
      color = '#10b981';
    } else if (score >= 3) {
      message = `⚠️ Manque : ${messages.join(', ')}`;
      color = '#fbbf24';
    } else {
      message = `❌ Trop faible : ${messages.join(', ')}`;
      color = '#ef4444';
    }
    
    setPasswordStrength({ score, message, color });
    return score >= 5;
  };

  // === AJOUT : Validation nom/prénom ===
  const isValidName = (name) => {
    return name && name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s-]+$/.test(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // === Vérifier blocage ===
    if (blockedUntil && blockedUntil > Date.now()) {
      const minutes = Math.ceil((blockedUntil - Date.now()) / 60000);
      setError(`Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`);
      return;
    }
    
    // === Validation nom ===
    if (!isValidName(form.nom)) {
      setError('Nom invalide (minimum 2 caractères, lettres uniquement)');
      return;
    }
    
    // === Validation prénom ===
    if (!isValidName(form.prenom)) {
      setError('Prénom invalide (minimum 2 caractères, lettres uniquement)');
      return;
    }
    
    // === Validation email ===
    if (!isValidEmail(form.login)) {
      setError('Veuillez entrer un email valide (exemple: nom@domaine.com)');
      return;
    }
    
    // === Vérification email jetable ===
    if (isDisposableEmail(form.login)) {
      setError('Les emails temporaires ne sont pas autorisés. Utilisez un email permanent.');
      return;
    }
    
    // === Validation mot de passe fort ===
    if (!checkPasswordStrength(form.password)) {
      setError('Mot de passe trop faible. ' + passwordStrength.message);
      return;
    }
    
    // === Vérification confirmation ===
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    
    try {
      const res = await api.post('/auth/register', {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        login: form.login.trim().toLowerCase(),
        password: form.password
      });
      
      // Succès : réinitialiser
      setAttempts(0);
      setBlockedUntil(null);
      localStorage.removeItem('registerBlockedUntil');
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);
      window.location.href = '/utilisateur';
      
    } catch (err) {
      // Compter les tentatives échouées
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        const blockTime = Date.now() + (15 * 60 * 1000);
        setBlockedUntil(blockTime);
        localStorage.setItem('registerBlockedUntil', blockTime);
        setError('Trop de tentatives. Compte bloqué 15 minutes.');
      } else {
        const errorMsg = err.response?.data || 'Erreur lors de la création du compte';
        setError(errorMsg);
      }
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
          {/* <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
            ET
          </div> */}
        </div>

        {/* Texte */}
        <div>
          <h1 style={{ fontSize: 70, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Rejoignez<br />
            <span style={{ color: '#ddd6fe' }}>notre</span><br />
            plateforme
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 280 }}>
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
      <div style={{ flex: 1, background: '#1a0f35', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 45, fontWeight: 700, color: '#f1f0ff', marginBottom: 6 }}>
              Créer un compte
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Excellent Training — ISI Tunis
            </p>
          </div>

          {/* === Affichage erreur === */}
          {error && (
            <div style={{ 
              background: blockedUntil && blockedUntil > Date.now() 
                ? 'rgba(245,158,11,0.1)' 
                : 'rgba(239,68,68,0.1)', 
              border: `1px solid ${blockedUntil && blockedUntil > Date.now() 
                ? 'rgba(245,158,11,0.2)' 
                : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 8, 
              padding: '10px 14px', 
              fontSize: 13, 
              color: blockedUntil && blockedUntil > Date.now() ? '#fbbf24' : '#fca5a5', 
              marginBottom: 20 
            }}>
              ⚠ {error}
            </div>
          )}

          {/* === Indicateur blocage === */}
          {blockedUntil && blockedUntil > Date.now() && countdown > 0 && (
            <div style={{ 
              background: 'rgba(245,158,11,0.15)', 
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8, 
              padding: '10px 14px', 
              fontSize: 13, 
              color: '#fbbf24', 
              marginBottom: 20,
              textAlign: 'center'
            }}>
                 Trop de tentatives. Réessayez dans {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Nom + Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Nom </label>
                <input 
                  type="text" 
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  required 
                  style={inputStyle}
                  disabled={blockedUntil && blockedUntil > Date.now()}
                />
              </div>
              <div>
                <label style={labelStyle}>Prénom </label>
                <input 
                  type="text" 
                  placeholder="Votre prénom"
                  value={form.prenom}
                  onChange={e => setForm({ ...form, prenom: e.target.value })}
                  required 
                  style={inputStyle}
                  disabled={blockedUntil && blockedUntil > Date.now()}
                />
              </div>
            </div>

            {/* Email (Identifiant) */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email  </label>
              <input 
                type="email" 
                placeholder="Enterez votre adresse email"
                value={form.login}
                onChange={e => setForm({ ...form, login: e.target.value })}
                required 
                style={{
                  ...inputStyle,
                  borderColor: form.login && !isValidEmail(form.login) && form.login.length > 0
                    ? 'rgba(239,68,68,0.5)'
                    : form.login && isDisposableEmail(form.login)
                    ? 'rgba(245,158,11,0.5)'
                    : 'rgba(139,92,246,0.2)'
                }}
                disabled={blockedUntil && blockedUntil > Date.now()}
              />
              {form.login && !isValidEmail(form.login) && form.login.length > 0 && (
                <div style={{ fontSize: 10, color: '#fca5a5', marginTop: 5 }}>
                  ⚠️ Format email invalide
                </div>
              )}
              {form.login && isValidEmail(form.login) && isDisposableEmail(form.login) && (
                <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 5 }}>
                  ⚠️ Email temporaire non autorisé
                </div>
              )}
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Mot de passe </label>
              <input 
                type="password" 
                placeholder="Entrez un mot de passe "
                value={form.password}
                onChange={e => {
                  setForm({ ...form, password: e.target.value });
                  checkPasswordStrength(e.target.value);
                }}
                required 
                style={inputStyle}
                disabled={blockedUntil && blockedUntil > Date.now()}
              />
              {/* === Indicateur force mot de passe === */}
              {form.password && (
                <div style={{ 
                  fontSize: 10, 
                  color: passwordStrength.color, 
                  marginTop: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>{passwordStrength.message}</span>
                  <div style={{ 
                    flex: 1, 
                    height: 3, 
                    background: '#2d2d3d',
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`, 
                      height: '100%', 
                      background: passwordStrength.color,
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmer */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirmer le mot de passe </label>
              <input 
                type="password" 
                placeholder="Répétez votre mot de passe"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required 
                style={{
                  ...inputStyle,
                  borderColor: form.confirmPassword && form.password !== form.confirmPassword
                    ? 'rgba(239,68,68,0.5)'
                    : form.confirmPassword && form.password === form.confirmPassword
                    ? 'rgba(16,185,129,0.5)'
                    : 'rgba(139,92,246,0.2)'
                }}
                disabled={blockedUntil && blockedUntil > Date.now()}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div style={{ fontSize: 10, color: '#fca5a5', marginTop: 5 }}>
                  ⚠️ Les mots de passe ne correspondent pas
                </div>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password.length > 0 && (
                <div style={{ fontSize: 10, color: '#10b981', marginTop: 5 }}>
                  ✓ Mots de passe identiques
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || (blockedUntil && blockedUntil > Date.now())} 
              style={{
                width: '100%', height: 46,
                background: (loading || (blockedUntil && blockedUntil > Date.now())) ? 'rgba(16,185,129,0.4)' : '#6d28d9',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: (loading || (blockedUntil && blockedUntil > Date.now())) ? 'not-allowed' : 'pointer',
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