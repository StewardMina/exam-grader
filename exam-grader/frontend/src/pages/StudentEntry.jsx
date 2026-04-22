import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function StudentEntry() {
  const [form, setForm] = useState({ name: '', code: '', grade: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pastResults, setPastResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (result) {
      api.get(`/api/student/my-results?name=${encodeURIComponent(form.name)}&grade=${encodeURIComponent(form.grade)}&code=${form.code}`)
        .then(setPastResults)
        .catch(() => {});
    }
  }, [result]);

  async function enter(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/api/student/enter', { code: form.code });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Encabezado */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>📚 {result.subject.name}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Docente: {result.subject.teacher.name} · Hola, <strong>{form.name}</strong> · {form.grade}
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { setResult(null); setPastResults([]); }}>
            ← Cambiar
          </button>
        </div>

        {/* Exámenes activos */}
        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>Exámenes disponibles</h3>
          {result.exams.length === 0 ? (
            <div className="card empty-state">No hay exámenes activos en este momento.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {result.exams.map(exam => (
                <button
                  key={exam.id}
                  className="card"
                  style={{ cursor: 'pointer', textAlign: 'left', border: '2px solid var(--border)', transition: 'border-color 0.15s', width: '100%' }}
                  onClick={() => navigate(`/exam/${exam.id}`, { state: { studentName: form.name, studentGrade: form.grade, subjectCode: form.code } })}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{exam.title}</strong>
                    <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Comenzar →</span>
                  </div>
                  {exam.description && <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{exam.description}</p>}
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-gray">{exam._count.questions} preguntas</span>
                    {exam.timeLimit > 0 && <span className="badge badge-yellow">⏱ {exam.timeLimit} min</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resultados previos */}
        {pastResults.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '0.75rem' }}>Mis exámenes resueltos</h3>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>Examen</th>
                    <th>Fecha</th>
                    <th>Calificación</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pastResults.map(s => {
                    const nota = s.score !== null ? (s.score / s.totalPoints * 10).toFixed(1) : null;
                    return (
                      <tr key={s.id}>
                        <td><strong>{s.exam.title}</strong></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('es') : '-'}
                        </td>
                        <td>
                          {nota
                            ? <strong style={{ color: parseFloat(nota) >= 5 ? 'var(--success)' : 'var(--danger)' }}>{nota}/10</strong>
                            : <span style={{ color: 'var(--muted)' }}>-</span>
                          }
                        </td>
                        <td>
                          <span className={`badge ${s.isPending ? 'badge-yellow' : 'badge-green'}`}>
                            {s.isPending ? 'Pendiente' : 'Calificado'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>📝 Sistema de Exámenes</h1>
      <p style={{ color: 'var(--muted)' }}>Completa tus datos para ingresar</p>
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
            <label>Código de materia</label>
            <input
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="Ej: MAT301"
              style={{ fontFamily: 'monospace', letterSpacing: '0.1em', textAlign: 'center' }}
              maxLength={8}
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
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Buscando...' : 'Ingresar →'}
          </button>
        </form>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>¿Eres docente? <a href="/login">← Iniciar sesión</a></p>
    </div>
  );
}
