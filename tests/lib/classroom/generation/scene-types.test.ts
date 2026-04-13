import { describe, it, expect } from "vitest";
import { buildScenePrompt } from "@/lib/classroom/generation/prompts";

describe("Scene type prompts", () => {
  it("interactive scene prompt mentions interactivity", () => {
    const item = { title: "Ohm's Law Sim", description: "Simulate circuits", sceneType: "interactive" as const, keyPoints: ["V=IR"] };
    const prompt = buildScenePrompt(item, "Ohm's law context");
    expect(prompt.toLowerCase()).toContain("interactive");
  });

  it("discussion scene prompt does not request slide elements", () => {
    const item = { title: "Review", description: "Discuss", sceneType: "discussion" as const, keyPoints: ["summarize"] };
    const prompt = buildScenePrompt(item, "");
    expect(prompt).not.toContain('"elements"');
  });
});
