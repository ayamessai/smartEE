import express from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public preview: few results without contact
router.get('/preview', async (req, res) => {
  const { wilaya } = req.query;
  const filter = { role: 'repairman' };
  if (wilaya) filter['profile.wilaya'] = wilaya;
  const results = await User.find(filter).select('name profile.wilaya profile.ratingsAvg').limit(6);
  res.json(results);
});

// Full list requires login
router.get('/', requireAuth, async (req, res) => {
  const { wilaya } = req.query;
  const filter = { role: 'repairman' };
  if (wilaya) filter['profile.wilaya'] = wilaya;
  const results = await User.find(filter).select('name profile.wilaya profile.phone profile.ratingsAvg profile.experienceYears');
  res.json(results);
});

export default router; 