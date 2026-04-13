import { describe, it, expect } from "vitest";
import { buildDeepSolveStages, buildStagePrompt } from "@/lib/chat/modes/deep-solve";

describe("Deep Solve", () => {
  it("defines four stages: plan, investigate, solve, verify", () => {
    const stages = buildDeepSolveStages();
    expect(stages).toHaveLength(4);
    expect(stages.map((s) => s.name)).toEqual(["plan", "investigate", "solve", "verify"]);
  });

  it("builds plan stage prompt with problem", () => {
    const prompt = buildStagePrompt("plan", "Prove √2 is irrational", []);
    expect(prompt).toContain("√2 is irrational");
    expect(prompt).toContain("plan");
  });

  it("builds investigate prompt with prior context", () => {
    const prompt = buildStagePrompt("investigate", "Prove √2", [
      { stage: "plan", content: "Use proof by contradiction." },
    ]);
    expect(prompt).toContain("proof by contradiction");
  });

  it("builds verify prompt including solution", () => {
    const prompt = buildStagePrompt("verify", "Prove √2", [
      { stage: "plan", content: "Plan..." },
      { stage: "investigate", content: "Research..." },
      { stage: "solve", content: "The proof is..." },
    ]);
    expect(prompt).toContain("verify");
    expect(prompt).toContain("The proof is...");
  });
});
