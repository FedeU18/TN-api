import express from 'express';
import { getWeatherFromAPI } from '../controllers/weather.controller.js';

const router = express.Router();

// GET /api/weather?q=lat,long o q=ciudad
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Falta parámetro q' });
    const data = await getWeatherFromAPI({ q });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
