import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', timeLimit: 0, subjectId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/api/exams'), api.get('/api/subjects')]).then(([e, s]) => {
      setExams(e);
      setSubjects(s);
      if (s.length > 0) setForm(f => ({ ...f, subjectId: s[0].id }));
      setLoading(false);
    });
  }, []);

  async function createExam(e) {
    e.preventDefault();
    setError('');
    try {
      const exam = await api.post('/api/exams', form);
      setExams([exam, ...exams]);
      setForm({ title: '', description: '', timeLimit: 0, subjectId: subjects[0]?.id || '' });
      navigate(`/exams/${exam.id}/questions`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleExam(id) {
    const updated = await api.patch(`/api/exams/${id}/toggle`);
    setExams(exams.map(e => e.id === id ? { ...e, isActive: updated.isActive } : e));
  }

  async function deleteExam(id) {
    if (!confirm('¿Eliminar este examen?')) return;
    await api.delete(`/api/exams/${id}`);
    setExams(exams.filter(e => e.id !== id));
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

        {subjects.length === 0 && (
          <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--warning-light)', borderColor: 'var(--warning)' }}>
            <p>Primero crea una materia para poder crear exámenes. <Link to="/subjects">Ir a Materias →</Link></p>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Nuevo Examen</h2>
            <form onSubmit={createExam}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Título del examen</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Ej: Parcial 1" />
                </div>
                <div className="form-group">
                  <label>Materia</label>
                  <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripción (opcional)</label>
                  <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Instrucciones breves..." />
                </div>
                <div className="form-group">
                  <label>Límite de tiempo (minutos, 0 = sin límite)</label>
                  <input type="number" min="0" value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button className="btn btn-primary" type="submit">Crear y agregar preguntas →</button>
            </form>
          </div>
        )}

        <h2 style={{ marginBottom: '1rem' }}>Mis Exámenes</h2>
        {loading ? <p>Cargando...</p> : exams.length === 0 ? (
          <div className="empty-state card">No hay exámenes aún.</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Materia</th>
                  <th>Preguntas</th>
                  <th>Envíos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td><strong>{exam.title}</strong></td>
                    <td>{exam.subject?.name}</td>
                    <td>{exam._count?.questions}</td>
                    <td>{exam._count?.submissions}</td>
                    <td>
                      <span className={`badge ${exam.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {exam.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link to={`/exams/${exam.id}/questions`} className="btn btn-outline btn-sm">Editar</Link>
                        <Link to={`/exams/${exam.id}/results`} className="btn btn-outline btn-sm">Resultados</Link>
                        <button className={`btn btn-sm ${exam.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleExam(exam.id)}>
                          {exam.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteExam(exam.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
