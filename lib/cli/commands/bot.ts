import type { CLICommand, CLIContext } from "../types"

async function listBots(ctx: CLIContext): Promise<void> {
  const response = await fetch(`${ctx.baseUrl}/api/tutorbot`)

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

async function createBot(args: readonly string[], ctx: CLIContext): Promise<void> {
  const [name, ...rest] = args
  const description = rest.join(" ")

  if (!name) {
    process.stderr.write("Error: name is required for create\n")
    process.exit(1)
  }

  const response = await fetch(`${ctx.baseUrl}/api/tutorbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  })

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

async function setBotStatus(id: string, action: "start" | "stop", ctx: CLIContext): Promise<void> {
  const response = await fetch(`${ctx.baseUrl}/api/tutorbot/${id}/${action}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    process.stderr.write(`Error: ${response.status} ${response.statusText}\n`)
    process.exit(1)
  }

  if (ctx.format === "json") {
    process.stdout.write(JSON.stringify({ id, action }) + "\n")
  } else {
    process.stdout.write(`Bot ${id} ${action}ed\n`)
  }
}

export const botCommand: CLICommand = {
  name: "bot",
  description: "Manage tutor bots",

  async execute(args: readonly string[], ctx: CLIContext): Promise<void> {
    const [subcommand, ...rest] = args

    if (subcommand === "list" || subcommand === undefined) {
      await listBots(ctx)
    } else if (subcommand === "create") {
      await createBot(rest, ctx)
    } else if (subcommand === "start") {
      const [id] = rest
      if (!id) {
        process.stderr.write("Error: id is required for start\n")
        process.exit(1)
      }
      await setBotStatus(id, "start", ctx)
    } else if (subcommand === "stop") {
      const [id] = rest
      if (!id) {
        process.stderr.write("Error: id is required for stop\n")
        process.exit(1)
      }
      await setBotStatus(id, "stop", ctx)
    } else {
      process.stderr.write(`Error: unknown bot subcommand "${subcommand}"\n`)
      process.stderr.write("Usage: bot [list|create|start|stop] [...args]\n")
      process.exit(1)
    }
  },
}
