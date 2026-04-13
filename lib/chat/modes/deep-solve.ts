export interface SolveStage {
  readonly name: string;
  readonly description: string;
}

export interface StageResult {
  readonly stage: string;
  readonly content: string;
}

const STAGES: readonly SolveStage[] = [
  {
    name: "plan",
    description:
      "Break the problem into clear sub-tasks and outline an approach. Do NOT attempt to solve yet.",
  },
  {
    name: "investigate",
    description:
      "Gather relevant information, definitions, and known results. Cite sources where applicable.",
  },
  {
    name: "solve",
    description:
      "Execute the plan step by step, showing all reasoning and intermediate results.",
  },
  {
    name: "verify",
    description:
      "Check the solution for correctness, edge cases, and completeness. Confirm the answer is justified.",
  },
];

export function buildDeepSolveStages(): readonly SolveStage[] {
  return STAGES;
}

function buildPriorContext(priorResults: readonly StageResult[]): string {
  if (priorResults.length === 0) return "";
  const lines = priorResults.map(
    (r) => `[${r.stage.toUpperCase()}]\n${r.content}`
  );
  return `\n\nPrior stage results:\n${lines.join("\n\n")}`;
}

const STAGE_INSTRUCTIONS: Readonly<Record<string, string>> = {
  plan:
    "You are in the PLAN stage. Break the problem into clear sub-tasks and outline a solution approach. Do NOT solve the problem yet — only plan.",
  investigate:
    "You are in the INVESTIGATE stage. Gather relevant information, definitions, theorems, and known results needed to solve the problem. Cite sources where applicable.",
  solve:
    "You are in the SOLVE stage. Execute the plan step by step, showing all reasoning and intermediate results clearly.",
  verify:
    "You are in the VERIFY stage. Review the solution for correctness, completeness, and edge cases. Confirm every step is justified.",
};

export function buildStagePrompt(
  stage: string,
  problem: string,
  priorResults: readonly StageResult[]
): string {
  const instruction =
    STAGE_INSTRUCTIONS[stage] ??
    `You are in the ${stage.toUpperCase()} stage. Complete this stage of the problem-solving process.`;

  const priorContext = buildPriorContext(priorResults);

  return `${instruction}

Stage: ${stage}

Problem:
${problem}${priorContext}`;
}
