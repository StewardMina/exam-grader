const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendResultEmail({ teacherEmail, teacherName, studentName, studentEmail, examTitle, score, totalPoints, isPending, submissionId }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const subject = isPending
    ? `[Exam Grader] ${studentName} completó "${examTitle}" - Revisión pendiente`
    : `[Exam Grader] ${studentName} completó "${examTitle}" - ${score}/${totalPoints}`;

  const html = `
    <h2>Nuevo resultado de examen</h2>
    <p><strong>Alumno:</strong> ${studentName} (${studentEmail})</p>
    <p><strong>Examen:</strong> ${examTitle}</p>
    ${isPending
      ? `<p><strong>Estado:</strong> Tiene preguntas abiertas pendientes de calificación manual.</p>`
      : `<p><strong>Calificación:</strong> ${score} / ${totalPoints} puntos (${((score / totalPoints) * 10).toFixed(1)}/10)</p>`
    }
    <p>Revisa el resultado en tu dashboard.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: teacherEmail,
    subject,
    html,
  });
}

module.exports = { sendResultEmail };
