import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User, { USER_ROLES } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_local_secret_change_me';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['buyer', 'seller', 'repairman']),
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) return res.status(409).json({ message: 'Email exists' });
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      profile: {},
    });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid input' });
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // 🔥 Always sign fresh token with this user’s ID + role
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },   // ✅ force string ID
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/logout', (req, res) => {
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile });
});

const profileSchema = z.object({
  bio: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  wilaya: z.string().optional(),
  phone: z.string().optional(),
});

router.put('/me/profile', requireAuth, async (req, res) => {
  try {
    const data = profileSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile: data } },   // ✅ Save into profile field
      { new: true }
    );

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0]?.message || 'Invalid input' });
    }
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/me', requireAuth, async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ ok: true });
});

export default router; 