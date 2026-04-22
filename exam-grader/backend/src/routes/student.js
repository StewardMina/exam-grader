const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { sendResultEmail } = require('../lib/email');
const prisma = new PrismaClient();

// Enter with subject code
router.post('/enter', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código requerido' });
  const subject = await prisma.subject.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      teacher: { select: { name: true } },
      exams: {
        where: { isActive: true },
        select: { id: true, title: true, description: true, timeLimit: true, _count: { select: { questions: true } } },
      },
    },
  });
  if (!subject) return res.status(404).json({ error: 'Código de materia no encontrado' });
  res.json({ subject: { id: subject.id, name: subject.name, code: subject.code, teacher: subject.teacher }, exams: subject.exams });
});

// Get exam for student (no correct answers)
router.get('/exam/:examId', async (req, res) => {
  const exam = await prisma.exam.findFirst({
    where: { id: req.params.examId, isActive: true },
    include: {
      subject: { include: { teacher: { select: { name: true, email: true } } } },
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: { select: { id: true, text: true } }, // no isCorrect!
        },
      },
    },
  });
  if (!exam) return res.status(404).json({ error: 'Examen no encontrado o no disponible' });
  res.json(exam);
});

// Submit exam
router.post('/exam/:examId/submit', async (req, res) => {
  const { studentName, studentGrade, answers } = req.body;
  if (!studentName || !studentGrade) return res.status(400).json({ error: 'Nombre y grado requeridos' });

  const exam = await prisma.exam.findFirst({
    where: { id: req.params.examId, isActive: true },
    include: {
      subject: { include: { teacher: true } },
      questions: { include: { options: true } },
    },
  });
  if (!exam) return res.status(404).json({ error: 'Examen no encontrado' });

  let score = 0;
  let totalPoints = 0;
  let isPending = false;
  const answerData = [];

  for (const question of exam.questions) {
    totalPoints += question.points;
    const studentAnswer = answers?.find(a => a.questionId === question.id);

    if (question.type === 'OPEN_TEXT') {
      isPending = true;
      answerData.push({
        questionId: question.id,
        textAnswer: studentAnswer?.textAnswer || '',
        points: null,
      });
    } else {
      const selectedOption = question.options.find(o => o.id === studentAnswer?.selectedId);
      const isCorrect = selectedOption?.isCorrect || false;
      const pts = isCorrect ? question.points : 0;
      score += pts;
      answerData.push({
        questionId: question.id,
        selectedId: studentAnswer?.selectedId || null,
        points: pts,
      });
    }
  }

  const submission = await prisma.submission.create({
    data: {
      examId: exam.id,
      studentName,
      studentGrade,
      submittedAt: new Date(),
      score: isPending ? null : score,
      totalPoints,
      isPending,
      answers: {
        create: answerData,
      },
    },
  });

  // Send email
  try {
    await sendResultEmail({
      teacherEmail: exam.subject.teacher.email,
      teacherName: exam.subject.teacher.name,
      studentName,
      studentGrade,
      examTitle: exam.title,
      score: isPending ? null : score,
      totalPoints,
      isPending,
      submissionId: submission.id,
    });
  } catch (e) {
    console.error('Email error:', e.message);
  }

  res.json({
    submissionId: submission.id,
    score: isPending ? null : score,
    totalPoints,
    isPending,
  });
});

// Get student's past submissions by name + grade + subject code
router.get('/my-results', async (req, res) => {
  const { name, grade, code } = req.query;
  if (!name || !grade || !code) return res.status(400).json({ error: 'Faltan parámetros' });
  const subject = await prisma.subject.findUnique({ where: { code: code.toUpperCase() } });
  if (!subject) return res.status(404).json({ error: 'Materia no encontrada' });
  const submissions = await prisma.submission.findMany({
    where: {
      studentName: name,
      studentGrade: grade,
      exam: { subjectId: subject.id },
    },
    include: { exam: { select: { title: true } } },
    orderBy: { submittedAt: 'desc' },
  });
  res.json(submissions);
});

module.exports = router;
