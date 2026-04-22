import { useLocation, useNavigate } from 'react-router-dom';

export default function ExamDone() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  if (!result) { navigate('/'); return null; }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '450px', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ marginBottom: '0.5rem' }}>¡Examen entregado!</h1>
        {result.isPending ? (
          <p style={{ color: 'var(--muted)' }}>Tu examen tiene preguntas abiertas que serán revisadas por tu docente. Te notificarán tu calificación.</p>
        ) : (
          <div>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Tu calificación:</p>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              {(result.score / result.totalPoints * 10).toFixed(1)}<span style={{ fontSize: '1.5rem', color: 'var(--muted)' }}>/10</span>
            </div>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>({result.score}/{result.totalPoints} puntos)</p>
          </div>
        )}
        <button className="btn btn-outline" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
