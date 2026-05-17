import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const agents = [
    { id: 1, name: 'The Manager', status: 'Active' },
    { id: 2, name: 'The Developer', status: 'Idle' }
  ];
  res.status(200).json(agents);
});

export default router;
