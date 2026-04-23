import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentEntry() {
  const [form, setForm] = useState({ name: '', grade: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem('student');
    if (saved) navigate('/student');
  }, []);

  function enter(e) {
    e.preventDefault();
    sessionStorage.setItem('student', JSON.stringify({ name: form.name, grade: form.grade }));
    navigate('/student');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>📝 Sistema de Exámenes</h1>
      <p style={{ color: 'var(--muted)' }}>Ingresa tus datos para continuar</p>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <form onSubmit={enter}>
          <div className="form-group">
            <label>Tu nombre completo</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <div className="form-group">
            <label>Grado / Año</label>
            <input
              value={form.grade}
              onChange={e => setForm({ ...form, grade: e.target.value })}
              placeholder="Ej: 3° Año B"
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            Ingresar →
          </button>
        </form>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>¿Eres docente? <a href="/login">← Iniciar sesión</a></p>
    </div>
  );
}
