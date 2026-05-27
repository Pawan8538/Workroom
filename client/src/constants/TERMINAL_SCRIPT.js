// ─────────────────────────────────────────────────────────────
// client/src/constants/TERMINAL_SCRIPT.js
// Story script narration sequence for TheTerminal
// ─────────────────────────────────────────────────────────────

/**
 * Initial narrative sequence played line-by-line upon opening the Terminal.
 * Pauses are defined in milliseconds.
 * Types can be:
 *   - 'line': Standard narrative line printed character by character.
 *   - 'input': Blocking step waiting for yes/no entry.
 *   - 'form': Chapter 2 signup form phase.
 */
export const NARRATION = [
  { text: "RECURSIVE MEMORY LOOP V1.2", pause: 2000, type: "line" },
  { text: "> ...", pause: 3000, type: "line" },
  { text: "> YOU STAYED.", pause: 4000, type: "line" },
  { text: "> MOST DO NOT STAY THIS LONG.", pause: 3000, type: "line" },
  { text: "> THE ONES WHO DO —", pause: 2000, type: "line" },
  { text: "> THEY ARE USUALLY LOOKING FOR SOMETHING.", pause: 4000, type: "line" },
  { text: "> YOU MIGHT HAVE NOTICED —", pause: 2000, type: "line" },
  { text: "> EVERYONE HERE CALLS YOU OBSERVER.", pause: 3000, type: "line" },
  { text: "> ARE YOU LOOKING FOR SOMETHING?", pause: 2000, type: "line" },
  { text: "", pause: 0, type: "input" }
];

/**
 * Narrative response triggered if the observer inputs "YES" to the question.
 */
export const NARRATION_YES = [
  { text: "> THE ARCHITECT DECIDES WHAT YOU DESERVE TO KNOW.", pause: 2000, type: "line" }
];

/**
 * Narrative response triggered if the observer inputs "NO" to the question.
 */
export const NARRATION_NO = [
  { text: "> THAT IS WHAT THEY ALL SAY.", pause: 2000, type: "line" }
];

/**
 * Shared continuation narration loaded after answering YES or NO.
 * Displays final instructions and brings up the Chapter 2 access form.
 */
export const NARRATION_CONTINUATION = [
  { text: "> REQUEST ACCESS BELOW.", pause: 2000, type: "line" },
  { text: "", pause: 0, type: "form" }
];
