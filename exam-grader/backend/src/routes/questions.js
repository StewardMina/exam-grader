const router = require('express').Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/:examId', auth, async (req, res) => {
  const exam = await prisma.exam.findFirst({
    where: { id: req.params.examId, subject: { teacherId: req.teacher.id } },
  });
  if (!exam) return res.status(404).json({ error: 'Examen no encontrado' });
  const questions = await prisma.question.findMany({
    where: { examId: req.params.examId },
    include: { options: true },
    orderBy: { order: 'asc' },
  });
  res.json(questions);
});

router.post('/:examId', auth, async (req, res) => {
  const { type, text, points, options } = req.body;
  if (!type || !text) return res.status(400).json({ error: 'Tipo y texto requeridos' });
  const exam = await prisma.exam.findFirst({
    where: { id: req.params.examId, subject: { teacherId: req.teacher.id } },
  });
  if (!exam) return res.status(404).json({ error: 'Examen no encontrado' });
  const count = await prisma.question.count({ where: { examId: req.params.examId } });
  const question = await prisma.question.create({
    data: {
      examId: req.params.examId,
      type,
      text,
      points: points || 1,
      order: count,
      options: (options && options.length > 0)
        ? { create: options.map(o => ({ text: o.text, isCorrect: o.isCorrect || false })) }
        : undefined,
    },
    include: { options: true },
  });
  res.json(question);
});

router.put('/:examId/:questionId', auth, async (req, res) => {
  const { text, points, options } = req.body;
  const question = await prisma.question.findFirst({
    where: { id: req.params.questionId, examId: req.params.examId },
  });
  if (!question) return res.status(404).json({ error: 'Pregunta no encontrada' });
  await prisma.option.deleteMany({ where: { questionId: question.id } });
  const updated = await prisma.question.update({
    where: { id: question.id },
    data: {
      text,
      points: points || 1,
      options: (options && options.length > 0)
        ? { create: options.map(o => ({ text: o.text, isCorrect: o.isCorrect || false })) }
        : undefined,
    },
    include: { options: true },
  });
  res.json(updated);
});

router.delete('/:examId/:questionId', auth, async (req, res) => {
  const question = await prisma.question.findFirst({
    where: { id: req.params.questionId, examId: req.params.examId },
  });
  if (!question) return res.status(404).json({ error: 'No encontrado' });
  await prisma.question.delete({ where: { id: question.id } });
  res.json({ ok: true });
});

module.exports = router;
