import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state || {};
  const [exam, setExam] = useState(null);
  const [step, setStep] = useState('exam'); // exam | submitting
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/api/student/exam/${examId}`).then(setExam).catch(() => setError('Examen no disponible'));
  }, [examId]);

  useEffect(() => {
    if (!location.state) navigate('/');
  }, []);

  useEffect(() => {
    if (step === 'exam' && exam?.timeLimit > 0) {
      setTimeLeft(exam.timeLimit * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); submitExam(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  async function submitExam() {
    clearInterval(timerRef.current);
    setStep('submitting');
    const answerList = Object.entries(answers).map(([questionId, val]) => {
      const question = exam.questions.find(q => q.id === questionId);
      if (question.type === 'OPEN_TEXT') return { questionId, textAnswer: val };
      return { questionId, selectedId: val };
    });
    try {
      const result = await api.post(`/api/student/exam/${examId}/submit`, {
        studentName: student.studentName,
        studentGrade: student.studentGrade,
        answers: answerList,
      });
      navigate('/done', { state: { ...result, studentName: student.studentName, studentGrade: student.studentGrade, subjectCode: student.subjectCode } });
    } catch (e) {
      setError(e.message);
      setStep('exam');
    }
  }

  if (error) return <div style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--danger)' }}>{error}</p></div>;
  if (!exam) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando...</div>;

  if (step === 'submitting') return <div style={{ textAlign: 'center', padding: '4rem' }}>Enviando respuestas...</div>;

  const answered = Object.keys(answers).length;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid var(--border)', zIndex: 10, padding: '0.75rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{exam.title}</strong>
            <span style={{ color: 'var(--muted)', marginLeft: '1rem', fontSize: '0.9rem' }}>{answered}/{exam.questions.length} respondidas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {timeLeft !== null && (
              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: timeLeft < 60 ? 'var(--danger)' : 'var(--text)', fontWeight: 700 }}>
                ⏱ {formatTime(timeLeft)}
              </span>
            )}
            <button className="btn btn-success" onClick={() => { if (confirm('¿Entregar examen?')) submitExam(); }}>
              Entregar
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {exam.questions.map((q, i) => (
          <div key={q.id} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--muted)' }}>#{i + 1}</span>
              <span className="badge badge-gray">{q.points} pts</span>
              {answers[q.id] !== undefined && <span className="badge badge-green">✓</span>}
            </div>
            <p style={{ marginBottom: '1rem', fontWeight: 500 }}>{q.text}</p>

            {q.type === 'OPEN_TEXT' ? (
              <textarea
                value={answers[q.id] || ''}
                onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Escribe tu respuesta aquí..."
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', minHeight: '100px' }}
              />
            ) : (
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                {q.options.map(opt => (
                  <label key={opt.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    border: `2px solid ${answers[q.id] === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                    background: answers[q.id] === opt.id ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name={q.id} value={opt.id} checked={answers[q.id] === opt.id} onChange={() => setAnswers({ ...answers, [q.id]: opt.id })} />
                    {opt.text}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button className="btn btn-success" style={{ width: '100%', padding: '0.9rem' }} onClick={() => { if (confirm('¿Entregar examen?')) submitExam(); }}>
          Entregar examen
        </button>
      </div>
    </div>
  );
}
