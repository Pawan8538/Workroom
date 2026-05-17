import express from 'express';
import Goal from '../models/Goal.model.js';
import Task from '../models/Task.model.js';
import { splitGoalIntoTasks } from '../services/taskSplitter.service.js';

const router = express.Router();

// POST /api/goal — Receive a goal, split it via LLM, persist to MongoDB
router.post('/', async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return res.status(400).json({ error: 'A non-empty goal string is required' });
    }

    console.log(`[GoalRoute] New goal received: "${goal}"`);

    // 1. Save the goal to MongoDB
    const savedGoal = await Goal.create({ text: goal.trim() });
    console.log(`[GoalRoute] Goal saved with id: ${savedGoal._id}`);

    // 2. Call the LLM to split into tasks
    let taskArray;
    try {
      taskArray = await splitGoalIntoTasks(goal.trim());
    } catch (llmError) {
      // Mark goal as failed if LLM chokes
      savedGoal.status = 'Failed';
      await savedGoal.save();
      console.error(`[GoalRoute] LLM splitting failed:`, llmError.message);
      return res.status(502).json({ 
        error: 'Failed to split goal into tasks', 
        detail: llmError.message 
      });
    }

    // 3. Save each task to MongoDB, linking back to the goal
    const savedTasks = await Task.insertMany(
      taskArray.map(task => ({
        taskId: task.id,
        title: task.title,
        description: task.description,
        assignedRole: task.assignedRole,
        priority: task.priority,
        estimatedCycles: task.estimatedCycles,
        goal: savedGoal._id,
      }))
    );

    // 4. Update the goal with task references and mark active
    savedGoal.tasks = savedTasks.map(t => t._id);
    savedGoal.status = 'Active';
    await savedGoal.save();

    console.log(`[GoalRoute] ${savedTasks.length} tasks created and linked to goal`);

    // 5. Return everything to the frontend
    res.status(201).json({
      goal: savedGoal,
      tasks: savedTasks,
    });

  } catch (err) {
    console.error(`[GoalRoute] Unexpected error:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
