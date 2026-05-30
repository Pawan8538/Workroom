import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';

// ─────────────────────────────────────────────────────────────
// OpenAI client pointed at OpenRouter
// ─────────────────────────────────────────────────────────────
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = 'openrouter/auto';

// ─────────────────────────────────────────────────────────────
// System prompt — forces strict JSON array output
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Task Architect for Workroom, an AI-powered corporate office simulation.

Your job: decompose a user's high-level goal into concrete, actionable tasks and assign each to one of three office agents.

AGENTS:
- PM  (Product Manager)  — planning, specs, requirements, user stories, prioritization
- Backend (Backend Developer) — code, APIs, databases, architecture, implementation
- QA  (QA Engineer) — testing, validation, edge cases, security audits, bug verification

RULES:
1. Return ONLY a valid JSON array. No markdown, no explanation, no code fences, no text before or after.
2. Generate between 3 and 8 tasks depending on goal complexity.
3. Every task object must have exactly these fields:
   - "id"             : string, format "task-1", "task-2", etc.
   - "title"          : string, short actionable title (max 60 chars)
   - "description"    : string, one sentence describing the deliverable
   - "assignedRole"   : string, exactly one of "PM", "Backend", "QA"
   - "priority"       : number, 1 (critical) | 2 (important) | 3 (nice-to-have)
   - "estimatedCycles": number, integer 1-5 representing work cycles
4. Tasks should follow a logical execution order.
5. At least one task must be assigned to each role.

EXAMPLE OUTPUT:
[{"id":"task-1","title":"Define auth requirements","description":"Write user stories for login, signup, and password reset flows.","assignedRole":"PM","priority":1,"estimatedCycles":1},{"id":"task-2","title":"Design database schema","description":"Create MongoDB schemas for users, sessions, and tokens.","assignedRole":"Backend","priority":1,"estimatedCycles":2},{"id":"task-3","title":"Write auth test plan","description":"Outline test cases covering happy paths and edge cases for all auth endpoints.","assignedRole":"QA","priority":2,"estimatedCycles":1}]`;

// ─────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────
const VALID_ROLES = new Set(['PM', 'Backend', 'QA']);

function validateTask(task, index) {
  const errors = [];

  if (typeof task.id !== 'string' || !task.id.trim()) {
    task.id = `task-${index + 1}`;
  }
  if (typeof task.title !== 'string' || !task.title.trim()) {
    errors.push(`Task ${index}: missing or invalid title`);
  }
  if (typeof task.description !== 'string' || !task.description.trim()) {
    errors.push(`Task ${index}: missing or invalid description`);
  }
  if (!VALID_ROLES.has(task.assignedRole)) {
    errors.push(`Task ${index}: assignedRole must be PM, Backend, or QA — got "${task.assignedRole}"`);
  }
  if (![1, 2, 3].includes(task.priority)) {
    // Try to coerce
    const p = Number(task.priority);
    if ([1, 2, 3].includes(p)) {
      task.priority = p;
    } else {
      errors.push(`Task ${index}: priority must be 1, 2, or 3 — got "${task.priority}"`);
    }
  }
  if (typeof task.estimatedCycles !== 'number' || task.estimatedCycles < 1) {
    const c = Number(task.estimatedCycles);
    if (!isNaN(c) && c >= 1) {
      task.estimatedCycles = Math.round(c);
    } else {
      errors.push(`Task ${index}: estimatedCycles must be a positive integer — got "${task.estimatedCycles}"`);
    }
  }

  return errors;
}

function validateTaskArray(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('LLM returned empty or non-array response');
  }

  const allErrors = [];
  for (let i = 0; i < tasks.length; i++) {
    const errs = validateTask(tasks[i], i);
    allErrors.push(...errs);
  }

  if (allErrors.length > 0) {
    throw new Error(`Task validation failed:\n${allErrors.join('\n')}`);
  }

  return tasks;
}

// ─────────────────────────────────────────────────────────────
// Extract JSON from potentially messy LLM output
// ─────────────────────────────────────────────────────────────
function extractJSON(raw) {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Find the first [ and last ]
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON array found in LLM response');
  }

  const jsonStr = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (parseErr) {
    throw new Error(`Failed to parse JSON from LLM response: ${parseErr.message}\nRaw extract: ${jsonStr.substring(0, 300)}...`);
  }
}

// ─────────────────────────────────────────────────────────────
// Main export — splitGoalIntoTasks
// ─────────────────────────────────────────────────────────────
export async function splitGoalIntoTasks(goalText) {
  if (!goalText || typeof goalText !== 'string' || !goalText.trim()) {
    throw new Error('Goal text is required');
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  console.log(`[TaskSplitter] Splitting goal: "${goalText}"`);

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `GOAL: ${goalText}` }
    ],
    temperature: 0.4,      // Low temperature for structured output
    max_tokens: 2048,
  });

  const rawContent = response.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('LLM returned an empty response');
  }

  console.log(`[TaskSplitter] Raw LLM response (${rawContent.length} chars)`);

  // Parse and validate
  const parsed = extractJSON(rawContent);
  const validated = validateTaskArray(parsed);

  console.log(`[TaskSplitter] Successfully split into ${validated.length} tasks`);

  return validated;
}
