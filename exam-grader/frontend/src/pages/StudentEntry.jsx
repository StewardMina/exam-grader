import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function StudentEntry() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  async function enter(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/api/student/enter', { code });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem' }}>📚 {result.subject.name}</h1>
        <p style={{ color: 'var(--muted)' }}>Docente: {result.subject.teacher.name}</p>
      </div>

      {result.exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No hay exámenes activos en este momento.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '500px' }}>
          <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Selecciona el examen a rendir:</p>
          {result.exams.map(exam => (
            <button key={exam.id} className="card" style={{ cursor: 'pointer', textAlign: 'left', border: '2px solid var(--border)', transition: 'border-color 0.15s' }}
              onClick={() => navigate(`/exam/${exam.id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <strong>{exam.title}</strong>
              {exam.description && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{exam.description}</p>}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-gray">{exam._count.questions} preguntas</span>
                {exam.timeLimit > 0 && <span className="badge badge-yellow">⏱ {exam.timeLimit} min</span>}
              </div>
            </button>
          ))}
        </div>
      )}
      <button className="btn btn-outline" onClick={() => setResult(null)}>← Cambiar código</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>📝 Sistema de Exámenes</h1>
      <p style={{ color: 'var(--muted)' }}>Ingresa el código de tu materia</p>
      <div className="card" style={{ width: '100%', maxWidth: '380px' }}>
        <form onSubmit={enter}>
          <div className="form-group">
            <label>Código de materia</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: MAT301"
              style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '0.1em', textAlign: 'center' }}
              maxLength={8}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Buscando...' : 'Ingresar'}
          </button>
        </form>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>¿Eres docente? <a href="/login">Iniciar sesión</a></p>
    </div>
  );
}
