import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import Participants from './pages/Participants';
import Formateurs from './pages/Formateurs';
import Domaines from './pages/Domaines';
import Structures from './pages/Structures';
import Profils from './pages/Profils';
import Employeurs from './pages/Employeurs';
import Utilisateurs from './pages/Utilisateurs';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/formateurs" element={<Formateurs />} />
          <Route path="/domaines" element={<Domaines />} />
          <Route path="/structures" element={<Structures />} />
          <Route path="/profils" element={<Profils />} />
          <Route path="/employeurs" element={<Employeurs />} />
          <Route path="/utilisateurs" element={<Utilisateurs />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;