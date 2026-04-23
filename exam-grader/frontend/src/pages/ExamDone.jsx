import { useLocation, useNavigate } from 'react-router-dom';

function getScoreInfo(nota) {
  if (nota >= 9) return { emoji: '🏆', msg: '¡Excelente trabajo!', color: 'var(--success)' };
  if (nota >= 7) return { emoji: '⭐', msg: '¡Muy bien!', color: 'var(--primary)' };
  if (nota >= 5) return { emoji: '👍', msg: 'Aprobado', color: 'var(--warning)' };
  return { emoji: '📚', msg: 'Sigue estudiando', color: 'var(--danger)' };
}

export default function ExamDone() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  if (!result) { navigate('/'); return null; }

  const nota = result.isPending ? null : (result.score / result.totalPoints * 10);
  const info = nota !== null ? getScoreInfo(nota) : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Resultado principal */}
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {result.isPending ? '📋' : info.emoji}
          </div>
          <h1 style={{ marginBottom: '0.5rem' }}>¡Examen entregado!</h1>

          {result.isPending ? (
            <>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                Tu examen tiene preguntas abiertas que serán revisadas por tu docente. Pronto recibirás tu calificación.
              </p>
              <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius)', padding: '0.75rem', fontSize: '0.9rem', color: 'var(--warning)' }}>
                ⏳ Calificación pendiente de revisión
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>{info.msg}</p>
              <div style={{ fontSize: '4.5rem', fontWeight: 800, color: info.color, lineHeight: 1 }}>
                {nota.toFixed(1)}
                <span style={{ fontSize: '1.5rem', color: 'var(--muted)', fontWeight: 400 }}>/10</span>
              </div>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {result.score} de {result.totalPoints} puntos correctos
              </p>

              {/* Barra de progreso */}
              <div style={{ marginTop: '1.25rem', background: 'var(--border)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(nota / 10) * 100}%`,
                  height: '100%',
                  background: info.color,
                  borderRadius: '99px',
                  transition: 'width 1s ease'
                }} />
              </div>
            </>
          )}
        </div>

        {/* Info del alumno */}
        <div className="card" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--muted)' }}>Alumno</span>
            <strong>{result.studentName || 'Sin nombre'}</strong>
          </div>
          {result.studentGrade && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--muted)' }}>Grado</span>
              <strong>{result.studentGrade}</strong>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={() => navigate('/student')}>
            📋 Ver mis exámenes
          </button>
          <button className="btn btn-outline" style={{ width: '100%', padding: '0.75rem' }} onClick={() => { sessionStorage.removeItem('student'); navigate('/'); }}>
            🚪 Salir
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)' }}>
          Tu docente puede ver este resultado en el dashboard.
        </p>
      </div>
    </div>
  );
}
