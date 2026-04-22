import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => { api.get('/api/subjects').then(setSubjects); }, []);

  async function create(e) {
    e.preventDefault();
    setError('');
    try {
      const s = await api.post('/api/subjects', { name });
      setSubjects([...subjects, s]);
      setName('');
    } catch (e) { setError(e.message); }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar materia? Se eliminarán todos sus exámenes.')) return;
    await api.delete(`/api/subjects/${id}`);
    setSubjects(subjects.filter(s => s.id !== id));
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="page-header">
          <h1>Materias</h1>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Nueva Materia</h2>
          <form onSubmit={create} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Nombre de la materia</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Matemáticas 2do año" required />
            </div>
            <button className="btn btn-primary" type="submit">Crear</button>
          </form>
          {error && <p className="error-msg">{error}</p>}
        </div>

        {subjects.length === 0 ? (
          <div className="empty-state card">No hay materias. Crea una para empezar.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {subjects.map(s => (
              <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong>{s.name}</strong>
                  <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{s.code}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => copyCode(s.code)}>
                      {copied === s.code ? '¡Copiado!' : 'Copiar código'}
                    </button>
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>— comparte este código con tus alumnos</span>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => remove(s.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
