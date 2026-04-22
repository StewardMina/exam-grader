import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';

const TYPES = {
  MULTIPLE_CHOICE: 'Opción múltiple',
  TRUE_FALSE: 'Verdadero/Falso',
  OPEN_TEXT: 'Respuesta abierta',
};

function QuestionForm({ onSave, onCancel }) {
  const [type, setType] = useState('MULTIPLE_CHOICE');
  const [text, setText] = useState('');
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  useEffect(() => {
    if (type === 'TRUE_FALSE') {
      setOptions([
        { text: 'Verdadero', isCorrect: false },
        { text: 'Falso', isCorrect: false },
      ]);
    } else if (type === 'MULTIPLE_CHOICE') {
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    } else {
      setOptions([]);
    }
  }, [type]);

  function setCorrect(idx) {
    setOptions(options.map((o, i) => ({ ...o, isCorrect: i === idx })));
  }

  function submit(e) {
    e.preventDefault();
    if (type !== 'OPEN_TEXT' && !options.some(o => o.isCorrect)) {
      alert('Selecciona la respuesta correcta');
      return;
    }
    onSave({ type, text, points, options: type === 'OPEN_TEXT' ? [] : options });
  }

  return (
    <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--primary)' }}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Puntos</label>
            <input type="number" min="0.5" step="0.5" value={points} onChange={e => setPoints(parseFloat(e.target.value) || 1)} />
          </div>
        </div>
        <div className="form-group">
          <label>Enunciado</label>
          <textarea value={text} onChange={e => setText(e.target.value)} required placeholder="Escribe la pregunta..." />
        </div>

        {type !== 'OPEN_TEXT' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--muted)', marginBottom: '0.5rem' }}>
              Opciones (marca la correcta)
            </label>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => setCorrect(i)} />
                {type === 'TRUE_FALSE'
                  ? <span>{opt.text}</span>
                  : <input value={opt.text} onChange={e => setOptions(options.map((o, j) => j === i ? { ...o, text: e.target.value } : o))} placeholder={`Opción ${i + 1}`} style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                }
              </div>
            ))}
          </div>
        )}

        {type === 'OPEN_TEXT' && (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            El alumno escribirá su respuesta. Tú la calificarás manualmente.
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" type="submit">Guardar pregunta</button>
          <button className="btn btn-outline" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default function ExamBuilder() {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/api/exams`).then(exams => setExam(exams.find(e => e.id === examId)));
    api.get(`/api/questions/${examId}`).then(setQuestions);
  }, [examId]);

  async function saveQuestion(data) {
    const q = await api.post(`/api/questions/${examId}`, data);
    setQuestions([...questions, q]);
    setAdding(false);
  }

  async function deleteQuestion(qId) {
    if (!confirm('¿Eliminar pregunta?')) return;
    await api.delete(`/api/questions/${examId}/${qId}`);
    setQuestions(questions.filter(q => q.id !== qId));
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="page-header">
          <div>
            <Link to="/dashboard" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>← Dashboard</Link>
            <h1 style={{ marginTop: '0.25rem' }}>{exam?.title || 'Examen'}</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setAdding(true)} disabled={adding}>+ Agregar pregunta</button>
        </div>

        {adding && <QuestionForm onSave={saveQuestion} onCancel={() => setAdding(false)} />}

        {questions.length === 0 && !adding ? (
          <div className="empty-state card">No hay preguntas. Agrega la primera.</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {questions.map((q, i) => (
              <div key={q.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--muted)' }}>#{i + 1}</span>
                      <span className="badge badge-gray">{TYPES[q.type]}</span>
                      <span className="badge badge-green">{q.points} pts</span>
                    </div>
                    <p>{q.text}</p>
                    {q.options.length > 0 && (
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                        {q.options.map(o => (
                          <li key={o.id} style={{ color: o.isCorrect ? 'var(--success)' : 'inherit', fontWeight: o.isCorrect ? 600 : 400, fontSize: '0.9rem' }}>
                            {o.isCorrect ? '✓ ' : ''}{o.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteQuestion(q.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{questions.length} preguntas</strong> — Total: {questions.reduce((s, q) => s + q.points, 0)} puntos</span>
            <Link to="/dashboard" className="btn btn-primary">Listo →</Link>
          </div>
        )}
      </div>
    </>
  );
}
