import type { QuestionType } from "@/lib/core/types"

/**
 * Builds a prompt asking the LLM to generate a JSON array of quiz questions
 * from the provided context.
 */
export function buildQuizGenerationPrompt(
  context: string,
  numQuestions: number,
  questionTypes: readonly QuestionType[],
): string {
  const typesList = questionTypes.join(", ")

  return `You are a quiz generator. Based on the learning material below, generate exactly ${numQuestions} quiz question(s).

Allowed question types: ${typesList}

Rules:
- For "single_choice": provide 4 options; correctAnswer must be one of the options exactly.
- For "multiple_choice": provide 4 options; correctAnswer must be a comma-separated list of correct options.
- For "short_answer": omit the options field; correctAnswer is a concise expected answer.
- Each question must have a unique id (use a short uuid or slug), a clear explanation, and a non-empty correctAnswer.

Respond with ONLY a valid JSON array — no markdown fences, no extra text. Example shape:
[
  {
    "id": "q1",
    "type": "single_choice",
    "question": "What is X?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Because A is correct."
  }
]

## Learning Material

${context}`
}

/**
 * Builds a prompt asking the LLM to grade a single quiz answer.
 * The LLM must return a JSON object with isCorrect and feedback.
 */
export function buildGradingPrompt(
  question: string,
  correctAnswer: string,
  userAnswer: string,
): string {
  return `You are a quiz grader. Evaluate the student's answer and respond with ONLY a valid JSON object — no markdown fences, no extra text.

Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}

Respond with:
{
  "isCorrect": true | false,
  "feedback": "<one or two sentences explaining whether the answer is right or wrong and why>"
}`
}
