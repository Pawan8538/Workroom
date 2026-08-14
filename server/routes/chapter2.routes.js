import express from 'express';
import Chapter2Request from '../models/Chapter2Request.model.js';
import Visitor from '../models/Visitor.model.js';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key_if_none' });

router.post('/request', async (req, res) => {
  try {
    const { name, role, whatBuilding, linkedin, sessionId, visitStats } = req.body;
    
    if (!name || !role || !whatBuilding || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const request = await Chapter2Request.create({
      name,
      role,
      whatBuilding,
      linkedin,
      sessionId,
      visitStats,
      status: 'pending'
    });

    await Visitor.updateOne({ sessionId, type: 'visitor' }, { $set: { chapter2Requested: true } });

    res.status(200).json({ message: 'Request logged', request });
  } catch (err) {
    console.error('[Chapter2Routes] Error saving request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/queue', async (req, res) => {
   try {
     const requests = await Chapter2Request.find().sort({ requestedAt: -1 });
     res.json(requests);
   } catch(err) {
     res.status(500).json({ error: 'Failed to get queue' });
   }
});

export default router;
