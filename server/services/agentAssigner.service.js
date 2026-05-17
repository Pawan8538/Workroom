export const assignTasks = (tasks, agents) => {
  // Logic to map tasks to available agents
  return tasks.map((task, index) => ({
    ...task,
    assignedTo: agents[index % agents.length].id
  }));
};
