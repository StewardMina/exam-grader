import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const teacher = JSON.parse(localStorage.getItem('teacher') || 'null');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('teacher');
    navigate('/login');
  }

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/dashboard" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', textDecoration: 'none' }}>
          📝 Sistema de Exámenes
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/subjects">Materias</Link>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{teacher?.name}</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>Salir</button>
        </div>
      </div>
    </nav>
  );
}
