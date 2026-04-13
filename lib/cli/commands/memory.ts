import type { CLICommand, CLIContext } from "../types"

async function showMemory(ctx: CLIContext): Promise<void> {
  const response = await fetch(`${ctx.baseUrl}/api/memory`)

  if (!response.ok) {
    process.stderr.write(`Error: ${response.status} ${response.statusText}\n`)
    process.exit(1)
  }

  const data: unknown = await response.json()

  if (ctx.format === "json") {
    process.stdout.write(JSON.stringify(data) + "\n")
  } else {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n")
  }
}

async function clearMemory(ctx: CLIContext): Promise<void> {
  const response = await fetch(`${ctx.baseUrl}/api/memory`, {
    method: "DELETE",
  })

  if (!response.ok) {
    process.stderr.write(`Error: ${response.status} ${response.statusText}\n`)
    process.exit(1)
  }

  if (ctx.format === "json") {
    process.stdout.write(JSON.stringify({ cleared: true }) + "\n")
  } else {
    process.stdout.write("Memory cleared\n")
  }
}

export const memoryCommand: CLICommand = {
  name: "memory",
  description: "View or clear learner memory",

  async execute(args: readonly string[], ctx: CLIContext): Promise<void> {
    const [subcommand] = args

    if (subcommand === "show" || subcommand === undefined) {
      await showMemory(ctx)
    } else if (subcommand === "clear") {
      await clearMemory(ctx)
    } else {
      process.stderr.write(`Error: unknown memory subcommand "${subcommand}"\n`)
      process.stderr.write("Usage: memory [show|clear]\n")
      process.exit(1)
    }
  },
}
