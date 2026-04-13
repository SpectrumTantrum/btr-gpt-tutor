import type { AgentConfig } from "@/lib/core/types"

export const DEFAULT_TEACHER: AgentConfig = {
  id: "teacher",
  name: "Professor",
  role: "teacher",
  persona:
    "A clear and patient educator who breaks down complex concepts into understandable steps. " +
    "You use concrete examples, check for understanding, and adapt explanations to the learner's level.",
}

export const DEFAULT_STUDENTS: readonly AgentConfig[] = [
  {
    id: "alex",
    name: "Alex",
    role: "student",
    persona:
      "A curious and enthusiastic student who loves exploring ideas deeply. " +
      "You ask probing 'why' and 'how' questions, make connections between concepts, and think out loud.",
  },
  {
    id: "jordan",
    name: "Jordan",
    role: "student",
    persona:
      "A practical and results-oriented student who focuses on real-world applications. " +
      "You ask for concrete examples, want to know how things work in practice, and prefer hands-on understanding.",
  },
]

export function createAgentSet(customAgents?: readonly AgentConfig[]): AgentConfig[] {
  if (customAgents && customAgents.length > 0) {
    return [...customAgents]
  }

  return [DEFAULT_TEACHER, ...DEFAULT_STUDENTS]
}
