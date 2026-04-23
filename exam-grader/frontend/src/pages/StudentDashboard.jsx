import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const student = JSON.parse(sessionStorage.getItem('student') || 'null');
  const [subjects, setSubjects] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [dashError, setDashError] = useState('');
  const [loading, setLoading] = useState(true);

  const codesKey = `codes_${student?.name}_${student?.grade}`;

  useEffect(() => {
    if (!student) { navigate('/'); return; }
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const codes = JSON.parse(localStorage.getItem(codesKey) || '[]');
    if (codes.length === 0) { setLoading(false); return; }
    try {
      const data = await api.post('/api/student/dashboard', { name: student.name, grade: student.grade, codes });
      setSubjects(data);
    } catch (e) {
      setDashError(e.message);
    }
    setLoading(false);
  }

  async function addSubject(e) {
    e.preventDefault();
    setCodeError('');
    try {
      await api.post('/api/student/enter', { code: newCode });
      const codes = JSON.parse(localStorage.getItem(codesKey) || '[]');
      if (!codes.includes(newCode.toUpperCase())) {
        const updated = [...codes, newCode.toUpperCase()];
        localStorage.setItem(codesKey, JSON.stringify(updated));
      }
      setNewCode('');
      setLoading(true);
      loadDashboard();
    } catch (e) {
      setCodeError(e.message);
    }
  }

  function removeSubject(code) {
    const codes = JSON.parse(localStorage.getItem(codesKey) || '[]');
    localStorage.setItem(codesKey, JSON.stringify(codes.filter(c => c !== code)));
    setSubjects(subjects.filter(s => s.code !== code));
  }

  function logout() {
    sessionStorage.removeItem('student');
    navigate('/');
  }

  if (!student) return null;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '1rem' }}>📝 Mis Exámenes</strong>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
              {student.name} · {student.grade}
            </span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>

      <div className="container" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Agregar materia */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Agregar materia</h2>
          <form onSubmit={addSubject} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Código de materia</label>
              <input
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                placeholder="Ej: MAT301"
                style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
                maxLength={8}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit">Agregar</button>
          </form>
          {codeError && <p className="error-msg" style={{ marginTop: '0.5rem' }}>{codeError}</p>}
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Tu docente te da este código para acceder a los exámenes.
          </p>
        </div>

        {/* Sin materias */}
        {!loading && subjects.length === 0 && (
          <div className="card empty-state">
            Aún no tienes materias. Agrega el código que te dio tu docente.
          </div>
        )}

        {loading && <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Cargando...</p>}
        {dashError && <div className="card" style={{ background: 'var(--danger-light)', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Error: {dashError}</div>}

        {/* Materias */}
        {subjects.map(subject => (
          <div key={subject.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>📚 {subject.name}</h2>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Docente: {subject.teacher.name} · Código: <strong style={{ fontFamily: 'monospace' }}>{subject.code}</strong>
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => removeSubject(subject.code)}>Quitar</button>
            </div>

            {/* Exámenes disponibles */}
            <h3 style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Exámenes disponibles
            </h3>
            {subject.exams.filter(e => !e.alreadyDone).length === 0 ? (
              <div className="card" style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                No hay exámenes pendientes.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                {subject.exams.filter(e => !e.alreadyDone).map(exam => (
                  <div key={exam.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{exam.title}</strong>
                      {exam.description && <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{exam.description}</p>}
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                        <span className="badge badge-gray">{exam._count.questions} preguntas</span>
                        {exam.timeLimit > 0 && <span className="badge badge-yellow">⏱ {exam.timeLimit} min</span>}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/exam/${exam.id}`, { state: { studentName: student.name, studentGrade: student.grade, subjectCode: subject.code } })}
                    >
                      Iniciar →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Resultados */}
            {subject.submissions.length > 0 && (
              <>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mis resultados
                </h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '0.5rem' }}>
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
                      {subject.submissions.map(s => {
                        const nota = s.score !== null ? (s.score / s.totalPoints * 10).toFixed(1) : null;
                        return (
                          <tr key={s.id}>
                            <td><strong>{s.exam.title}</strong></td>
                            <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                              {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('es') : '-'}
                            </td>
                            <td>
                              {nota
                                ? <strong style={{ color: parseFloat(nota) >= 5 ? 'var(--success)' : 'var(--danger)' }}>{nota}/10</strong>
                                : <span style={{ color: 'var(--muted)' }}>—</span>
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
