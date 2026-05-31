import { getCompletion } from './llm.service.js';

export const generateCodeContent = async (taskTitle, goalText) => {
  const prompt = `You are a backend developer. You are currently working on a task: "${taskTitle}" as part of the overall goal: "${goalText}".
Generate 20-30 lines of realistic code that implements this task. Do not include markdown formatting or explanations, just the raw code. Keep it realistic but concise.`;
  const response = await getCompletion(prompt);
  return response.split('\n');
};

export const generateTestContent = async (taskTitle, goalText) => {
  const prompt = `You are a quality assurance engineer. You are currently working on a task: "${taskTitle}" as part of the overall goal: "${goalText}".
Generate 10-15 test cases in a clear pass/fail format (e.g. "✓ test description" or "✗ test description"). Do not include markdown formatting or explanations, just the list of test cases.`;
  const response = await getCompletion(prompt);
  return response.split('\n');
};

export const generateArchitectureContent = async (taskTitle, goalText) => {
  const prompt = `You are a product manager. You are currently working on a task: "${taskTitle}" as part of the overall goal: "${goalText}".
Generate a plain text ASCII architecture diagram (using boxes, lines, arrows like +---+ --->) that describes the architecture for this task. Keep it within 15-20 lines. Do not include markdown formatting or explanations, just the ASCII diagram.`;
  const response = await getCompletion(prompt);
  return response.split('\n');
};
