const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Todos los campos son requeridos' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const teacher = await prisma.teacher.create({ data: { name, email, password: hashed } });
    const token = jwt.sign({ id: teacher.id, email: teacher.email }, process.env.JWT_SECRET);
    res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  try {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) return res.status(400).json({ error: 'Credenciales incorrectas' });
    const valid = await bcrypt.compare(password, teacher.password);
    if (!valid) return res.status(400).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: teacher.id, email: teacher.email }, process.env.JWT_SECRET);
    res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
