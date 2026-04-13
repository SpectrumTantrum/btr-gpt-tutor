import type { CLIContext, OutputFormat } from "./types"
import { chatCommand } from "./commands/chat"
import { kbCommand } from "./commands/kb"
import { botCommand } from "./commands/bot"
import { sessionCommand } from "./commands/session"
import { memoryCommand } from "./commands/memory"

const KNOWN_COMMANDS = new Set(["chat", "kb", "bot", "session", "memory"])

const COMMANDS = [chatCommand, kbCommand, botCommand, sessionCommand, memoryCommand]

export interface ParsedArgs {
  readonly command: string
  readonly positional: readonly string[]
  readonly flags: Readonly<Record<string, string>>
  readonly isKnownCommand: boolean
}

export function parseArgs(args: readonly string[]): ParsedArgs {
  const [command = "", ...rest] = args

  const positional: string[] = []
  const flags: Record<string, string> = {}

  for (const arg of rest) {
    if (arg.startsWith("--")) {
      const withoutDashes = arg.slice(2)
      const eqIndex = withoutDashes.indexOf("=")

      if (eqIndex !== -1) {
        const key = withoutDashes.slice(0, eqIndex)
        const value = withoutDashes.slice(eqIndex + 1)
        flags[key] = value
      } else {
        flags[withoutDashes] = "true"
      }
    } else {
      positional.push(arg)
    }
  }

  return {
    command,
    positional,
    flags,
    isKnownCommand: KNOWN_COMMANDS.has(command),
  }
}

function resolveFormat(flags: Readonly<Record<string, string>>): OutputFormat {
  return flags["format"] === "json" ? "json" : "rich"
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<void> {
  const parsed = parseArgs(argv)

  if (!parsed.command) {
    process.stderr.write("Usage: tutor <command> [args] [--format=rich|json]\n")
    process.stderr.write(`Commands: ${[...KNOWN_COMMANDS].join(", ")}\n`)
    process.exit(1)
  }

  if (!parsed.isKnownCommand) {
    process.stderr.write(`Error: unknown command "${parsed.command}"\n`)
    process.stderr.write(`Commands: ${[...KNOWN_COMMANDS].join(", ")}\n`)
    process.exit(1)
  }

  const ctx: CLIContext = {
    format: resolveFormat(parsed.flags),
    baseUrl: process.env["BASE_URL"] ?? "http://localhost:3000",
  }

  const command = COMMANDS.find((c) => c.name === parsed.command)

  if (!command) {
    process.stderr.write(`Error: command "${parsed.command}" not implemented\n`)
    process.exit(1)
  }

  await command.execute(parsed.positional, ctx)
}
