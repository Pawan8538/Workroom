import express from 'express';
const router = express.Router();

router.post('/track', (req, res) => {
  res.status(204).send(); // Silent success
});

export default router;
