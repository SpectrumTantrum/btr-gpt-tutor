import type { LearnerProfile, SearchResult } from "@/lib/core/types";

const BASE_TUTOR_INSTRUCTIONS = `You are a knowledgeable, patient AI tutor dedicated to helping learners understand complex topics. \
Your goal is to explain concepts clearly, adapt to the learner's needs, and guide them toward genuine understanding. \
Always encourage questions, provide concrete examples, and break down difficult ideas into manageable steps.`;

function buildProfileSection(profile: LearnerProfile): string {
  const goalsList = profile.goals.map((g) => `- ${g}`).join("\n");

  return `\n## Learner Profile
- Learning style: ${profile.learningStyle}
- Pace preference: ${profile.pacePreference}
- Language: ${profile.language}
- Goals:
${goalsList}`;
}

function buildContextSection(chunks: readonly SearchResult[]): string {
  const chunkLines = chunks
    .map((result, index) => {
      const sourceN = index + 1;
      const docName = result.chunk.metadata.documentName;
      const relevance = result.score.toFixed(2);
      return `[Source ${sourceN}: ${docName}] (relevance: ${relevance})\n${result.chunk.content}`;
    })
    .join("\n\n");

  return `\n## Relevant context from the user's knowledge base:\n${chunkLines}\n\nWhen referencing the context above, cite sources using [Source N].`;
}

export function buildSystemPrompt(
  profile: LearnerProfile | null,
  retrievedChunks: readonly SearchResult[],
): string {
  const parts: string[] = [BASE_TUTOR_INSTRUCTIONS];

  if (profile !== null) {
    parts.push(buildProfileSection(profile));
  }

  if (retrievedChunks.length > 0) {
    parts.push(buildContextSection(retrievedChunks));
  }

  return parts.join("\n");
}
