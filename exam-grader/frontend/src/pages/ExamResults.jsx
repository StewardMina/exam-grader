import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

export default function ExamResults() {
  const { examId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => { api.get(`/api/results/exam/${examId}`).then(setData); }, [examId]);

  if (!data) return <><Navbar /><div className="container" style={{ padding: '2rem' }}>Cargando...</div></>;

  const avg = data.submissions.filter(s => s.score !== null).reduce((sum, s, _, arr) => sum + (s.score / s.totalPoints * 10) / arr.length, 0);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="page-header">
          <div>
            <Link to="/dashboard" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>← Dashboard</Link>
            <h1>Resultados: {data.exam.title}</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{data.submissions.length}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Entregas</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{isNaN(avg) ? '-' : avg.toFixed(1)}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Promedio (sobre 10)</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{data.submissions.filter(s => s.isPending).length}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Pendientes de calificación</div>
          </div>
        </div>

        {data.submissions.length === 0 ? (
          <div className="empty-state card">Nadie ha rendido este examen aún.</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Grado</th>
                  <th>Fecha</th>
                  <th>Calificación</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.studentName}</strong></td>
                    <td>{s.studentGrade}</td>
                    <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('es') : '-'}</td>
                    <td>
                      {s.score !== null
                        ? <strong>{(s.score / s.totalPoints * 10).toFixed(1)}/10 ({s.score}/{s.totalPoints} pts)</strong>
                        : <span style={{ color: 'var(--muted)' }}>-</span>
                      }
                    </td>
                    <td>
                      <span className={`badge ${s.isPending ? 'badge-yellow' : 'badge-green'}`}>
                        {s.isPending ? 'Pendiente' : 'Calificado'}
                      </span>
                    </td>
                    <td><Link to={`/submissions/${s.id}`} className="btn btn-outline btn-sm">Ver</Link></td>
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
