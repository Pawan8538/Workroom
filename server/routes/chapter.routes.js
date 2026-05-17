import express from 'express';
const router = express.Router();

router.post('/request', (req, res) => {
  res.status(200).json({ message: 'Request for Chapter 2 submitted' });
});

export default router;
