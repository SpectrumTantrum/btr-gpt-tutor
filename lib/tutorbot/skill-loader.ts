import { nanoid } from "nanoid"
import type { BotSkill } from "@/lib/core/types"

const REQUIRED_FIELDS: ReadonlyArray<keyof Omit<BotSkill, "id">> = [
  "name",
  "description",
  "instructions",
]

export function loadSkills(skills: readonly BotSkill[]): string {
  return skills
    .map(
      (skill) =>
        `Skill: ${skill.name}\nDescription: ${skill.description}\nInstructions: ${skill.instructions}`
    )
    .join("\n\n")
}

type SkillInput = Omit<BotSkill, "id">

export function registerSkill(botId: string, skill: SkillInput): BotSkill {
  for (const field of REQUIRED_FIELDS) {
    const value = skill[field]
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(
        `registerSkill: missing required field "${field}" for bot "${botId}"`
      )
    }
  }

  return {
    id: nanoid(),
    name: skill.name,
    description: skill.description,
    instructions: skill.instructions,
  }
}
