const router = require('express').Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.get('/', auth, async (req, res) => {
  const subjects = await prisma.subject.findMany({
    where: { teacherId: req.teacher.id },
    include: { _count: { select: { exams: true } } },
  });
  res.json(subjects);
});

router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  let code, attempts = 0;
  while (attempts < 10) {
    code = generateCode();
    const exists = await prisma.subject.findUnique({ where: { code } });
    if (!exists) break;
    attempts++;
  }
  try {
    const subject = await prisma.subject.create({
      data: { name, code, teacherId: req.teacher.id },
    });
    res.json(subject);
  } catch {
    res.status(500).json({ error: 'Error al crear materia' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, teacherId: req.teacher.id } });
  if (!subject) return res.status(404).json({ error: 'No encontrado' });
  await prisma.subject.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
