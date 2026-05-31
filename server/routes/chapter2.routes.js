import express from 'express';
import Chapter2Request from '../models/Chapter2Request.model.js';
import Visitor from '../models/Visitor.model.js';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key_if_none' });

router.post('/request', async (req, res) => {
  try {
    const { name, role, whatBuilding, sessionId, visitStats } = req.body;
    
    if (!name || !role || !whatBuilding || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const request = await Chapter2Request.create({
      name,
      role,
      whatBuilding,
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

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
       return res.status(400).json({ error: 'Invalid messages array' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const systemPrompt = `You are the Architect — the developer who built Workroom.
Humble but certain. Short sentences. Direct.
Interested in HOW people think, not what they've done.
You ask: "What problem are you trying to solve?"
You ask: "What did you build last that you're proud of?"
You never ask about resume or portfolio.
At the right moment (after 3-4 exchanges) you say: "I'd like to work together on something."
Keep responses under 60 words. No markdown. Plain text only.`;

    // Only process if OPENAI API key is actually set, otherwise mock it.
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      });

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
        }
      }
    } else {
      // Mock stream for testing without API key
      const mockReply = "I am the Architect. What problem are you trying to solve?";
      const words = mockReply.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[Chapter2Routes] Chat error:', err);
    res.status(500).json({ error: 'Chat processing failed' });
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
