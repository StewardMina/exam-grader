const router = require('express').Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/exam/:examId', auth, async (req, res) => {
  const exam = await prisma.exam.findFirst({
    where: { id: req.params.examId, subject: { teacherId: req.teacher.id } },
  });
  if (!exam) return res.status(404).json({ error: 'No encontrado' });
  const submissions = await prisma.submission.findMany({
    where: { examId: req.params.examId },
    orderBy: { submittedAt: 'desc' },
  });
  res.json({ exam, submissions });
});

router.get('/submission/:id', auth, async (req, res) => {
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: {
      exam: { include: { subject: true } },
      answers: {
        include: {
          question: { include: { options: true } },
          selected: true,
        },
      },
    },
  });
  if (!submission) return res.status(404).json({ error: 'No encontrado' });
  if (submission.exam.subject.teacherId !== req.teacher.id) return res.status(403).json({ error: 'Sin acceso' });
  res.json(submission);
});

// Grade open text answers manually
router.put('/submission/:id/grade', auth, async (req, res) => {
  const { grades } = req.body; // [{ answerId, points }]
  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: { exam: { include: { subject: true } }, answers: true },
  });
  if (!submission) return res.status(404).json({ error: 'No encontrado' });
  if (submission.exam.subject.teacherId !== req.teacher.id) return res.status(403).json({ error: 'Sin acceso' });

  for (const { answerId, points } of grades) {
    await prisma.answer.update({ where: { id: answerId }, data: { points } });
  }

  const allAnswers = await prisma.answer.findMany({ where: { submissionId: submission.id } });
  const newScore = allAnswers.reduce((sum, a) => sum + (a.points || 0), 0);

  const updated = await prisma.submission.update({
    where: { id: submission.id },
    data: { score: newScore, isPending: false },
  });
  res.json(updated);
});

module.exports = router;
