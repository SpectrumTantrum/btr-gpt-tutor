import type { CLICommand, CLIContext } from "../types"

async function listSessions(ctx: CLIContext): Promise<void> {
  const response = await fetch(`${ctx.baseUrl}/api/session`)

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

async function showSession(id: string, ctx: CLIContext): Promise<void> {
  const response = await fetch(`${ctx.baseUrl}/api/session/${id}`)

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

export const sessionCommand: CLICommand = {
  name: "session",
  description: "View chat sessions",

  async execute(args: readonly string[], ctx: CLIContext): Promise<void> {
    const [subcommand, ...rest] = args

    if (subcommand === "list" || subcommand === undefined) {
      await listSessions(ctx)
    } else if (subcommand === "show") {
      const [id] = rest
      if (!id) {
        process.stderr.write("Error: id is required for show\n")
        process.exit(1)
      }
      await showSession(id, ctx)
    } else {
      process.stderr.write(`Error: unknown session subcommand "${subcommand}"\n`)
      process.stderr.write("Usage: session [list|show <id>]\n")
      process.exit(1)
    }
  },
}
