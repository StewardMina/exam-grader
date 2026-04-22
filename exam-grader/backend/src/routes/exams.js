const router = require('express').Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  const exams = await prisma.exam.findMany({
    where: { subject: { teacherId: req.teacher.id } },
    include: {
      subject: true,
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(exams);
});

router.post('/', auth, async (req, res) => {
  const { title, description, timeLimit, subjectId } = req.body;
  if (!title || !subjectId) return res.status(400).json({ error: 'Título y materia requeridos' });
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, teacherId: req.teacher.id } });
  if (!subject) return res.status(403).json({ error: 'Materia no encontrada' });
  const exam = await prisma.exam.create({
    data: { title, description, timeLimit: timeLimit || 0, subjectId },
    include: { subject: true },
  });
  res.json(exam);
});

router.put('/:id', auth, async (req, res) => {
  const { title, description, timeLimit } = req.body;
  const exam = await prisma.exam.findFirst({
    where: { id: req.params.id, subject: { teacherId: req.teacher.id } },
  });
  if (!exam) return res.status(404).json({ error: 'No encontrado' });
  const updated = await prisma.exam.update({
    where: { id: req.params.id },
    data: { title, description, timeLimit: timeLimit || 0 },
  });
  res.json(updated);
});

router.patch('/:id/toggle', auth, async (req, res) => {
  const exam = await prisma.exam.findFirst({
    where: { id: req.params.id, subject: { teacherId: req.teacher.id } },
  });
  if (!exam) return res.status(404).json({ error: 'No encontrado' });
  const updated = await prisma.exam.update({
    where: { id: req.params.id },
    data: { isActive: !exam.isActive },
  });
  res.json(updated);
});

router.delete('/:id', auth, async (req, res) => {
  const exam = await prisma.exam.findFirst({
    where: { id: req.params.id, subject: { teacherId: req.teacher.id } },
  });
  if (!exam) return res.status(404).json({ error: 'No encontrado' });
  await prisma.exam.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
