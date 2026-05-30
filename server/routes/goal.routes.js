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

    // Reset any stale fourthWallTriggered state from previous sessions (temp testing fix)
    await Goal.updateMany({}, { fourthWallTriggered: false });
    const savedGoal = await Goal.create({ text: goal.trim(), fourthWallTriggered: false });
    console.log(`[GoalRoute] Goal saved with id: ${savedGoal._id}`);

    // 2. Call the LLM to split into tasks
    let taskArray;
    try {
      taskArray = await splitGoalIntoTasks(goal.trim());
      const tasks = taskArray;
      console.log('[GOAL] Tasks created:', tasks);
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

    const io = req.app.get('io') || global._io;

    // Emit each task assignment to the correct agent
    savedTasks.forEach(task => {
      io.emit('agent:taskAssigned', {
        agentId: task.assignedRole.toLowerCase(),
        task: {
          id: task.taskId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimatedCycles: task.estimatedCycles,
        },
        timestamp: new Date().toISOString(),
      });

      io.emit('agent:stateChanged', {
        agentId: task.assignedRole.toLowerCase(),
        state: 'working',
        detail: task.title,
        timestamp: new Date().toISOString(),
      });
    });

    // Simulate task completion after estimatedCycles * 6 seconds
    // Then check if all tasks done and trigger fourth wall
    savedTasks.forEach(task => {
      const delay = (task.estimatedCycles || 3) * 6000;
      setTimeout(async () => {
        io.emit('agent:stateChanged', {
          agentId: task.assignedRole.toLowerCase(),
          state: 'idle',
          detail: null,
          timestamp: new Date().toISOString(),
        });

        // Mark task complete in DB
        await Task.findByIdAndUpdate(task._id, { status: 'completed' });

        // Check if ALL tasks for this goal are now complete
        const remaining = await Task.countDocuments({
          goal: task.goal,
          status: { $ne: 'completed' }
        });

        console.log(`[GoalRoute] Task "${task.title}" complete. Remaining: ${remaining}`);

        if (remaining === 0) {
  const updated = await Goal.findOneAndUpdate(
    { _id: task.goal, fourthWallTriggered: { $ne: true } },
    { fourthWallTriggered: true }
  );
  if (updated) {
    console.log('[GoalRoute] All tasks complete — triggering fourth wall');
    io.emit('simulation:fourthWallTrigger', {
      reason: 'All tasks completed.',
      timestamp: new Date().toISOString(),
    });
  }
}
      }, delay);
    });

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
