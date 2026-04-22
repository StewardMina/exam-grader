import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

export default function SubmissionDetail() {
  const { id } = useParams();
  const [sub, setSub] = useState(null);
  const [grades, setGrades] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get(`/api/results/submission/${id}`).then(setSub); }, [id]);

  async function saveGrades(e) {
    e.preventDefault();
    const gradeList = Object.entries(grades).map(([answerId, points]) => ({ answerId, points: parseFloat(points) }));
    const updated = await api.put(`/api/results/submission/${id}/grade`, { grades: gradeList });
    setSub(s => ({ ...s, score: updated.score, isPending: false }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!sub) return <><Navbar /><div className="container" style={{ padding: '2rem' }}>Cargando...</div></>;

  const openAnswers = sub.answers.filter(a => a.question.type === 'OPEN_TEXT');
  const hasOpenPending = sub.isPending && openAnswers.length > 0;

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="page-header">
          <div>
            <Link to={`/exams/${sub.exam.id}/results`} style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>← Resultados</Link>
            <h1>{sub.studentName}</h1>
            <p style={{ color: 'var(--muted)' }}>Grado: {sub.studentGrade} — {sub.exam.title}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {sub.score !== null && (
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                {(sub.score / sub.totalPoints * 10).toFixed(1)}/10
              </div>
            )}
            <span className={`badge ${sub.isPending ? 'badge-yellow' : 'badge-green'}`}>
              {sub.isPending ? 'Pendiente de calificación' : 'Calificado'}
            </span>
          </div>
        </div>

        <form onSubmit={saveGrades}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {sub.answers.map((answer, i) => (
              <div key={answer.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--muted)' }}>Pregunta {i + 1}</span>
                  <span className="badge badge-gray">{answer.question.points} pts</span>
                </div>
                <p style={{ marginBottom: '0.75rem' }}>{answer.question.text}</p>

                {answer.question.type === 'OPEN_TEXT' ? (
                  <div>
                    <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                      <strong>Respuesta:</strong> {answer.textAnswer || <em style={{ color: 'var(--muted)' }}>Sin respuesta</em>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Puntos asignados:</label>
                      <input
                        type="number"
                        min="0"
                        max={answer.question.points}
                        step="0.5"
                        defaultValue={answer.points ?? ''}
                        onChange={e => setGrades(g => ({ ...g, [answer.id]: e.target.value }))}
                        style={{ width: '80px', padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                      />
                      <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>/ {answer.question.points}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {answer.question.options.map(opt => (
                      <div key={opt.id} style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: 'var(--radius)',
                        marginBottom: '0.3rem',
                        background: opt.isCorrect ? 'var(--success-light)' : (answer.selected?.id === opt.id && !opt.isCorrect) ? 'var(--danger-light)' : 'var(--bg)',
                        border: `1px solid ${opt.isCorrect ? 'var(--success)' : (answer.selected?.id === opt.id && !opt.isCorrect) ? 'var(--danger)' : 'var(--border)'}`,
                        fontSize: '0.9rem',
                      }}>
                        {answer.selected?.id === opt.id ? '→ ' : ''}{opt.text}
                        {opt.isCorrect && ' ✓'}
                      </div>
                    ))}
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: answer.points > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {answer.points > 0 ? `+${answer.points} puntos` : 'Incorrecto'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasOpenPending && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="btn btn-success" type="submit">Guardar calificación</button>
              {saved && <span className="success-msg">¡Guardado!</span>}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
