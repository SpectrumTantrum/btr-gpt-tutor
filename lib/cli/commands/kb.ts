import type { CLICommand, CLIContext } from "../types"

async function listKnowledge(ctx: CLIContext): Promise<void> {
  const response = await fetch(`${ctx.baseUrl}/api/knowledge`)

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

async function createKnowledge(args: readonly string[], ctx: CLIContext): Promise<void> {
  const [title, ...rest] = args
  const content = rest.join(" ")

  if (!title) {
    process.stderr.write("Error: title is required for create\n")
    process.exit(1)
  }

  const response = await fetch(`${ctx.baseUrl}/api/knowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
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

async function deleteKnowledge(args: readonly string[], ctx: CLIContext): Promise<void> {
  const [id] = args

  if (!id) {
    process.stderr.write("Error: id is required for delete\n")
    process.exit(1)
  }

  const response = await fetch(`${ctx.baseUrl}/api/knowledge/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    process.stderr.write(`Error: ${response.status} ${response.statusText}\n`)
    process.exit(1)
  }

  if (ctx.format === "json") {
    process.stdout.write(JSON.stringify({ deleted: id }) + "\n")
  } else {
    process.stdout.write(`Deleted knowledge entry: ${id}\n`)
  }
}

export const kbCommand: CLICommand = {
  name: "kb",
  description: "Manage knowledge base entries",

  async execute(args: readonly string[], ctx: CLIContext): Promise<void> {
    const [subcommand, ...rest] = args

    if (subcommand === "list" || subcommand === undefined) {
      await listKnowledge(ctx)
    } else if (subcommand === "create") {
      await createKnowledge(rest, ctx)
    } else if (subcommand === "delete") {
      await deleteKnowledge(rest, ctx)
    } else {
      process.stderr.write(`Error: unknown kb subcommand "${subcommand}"\n`)
      process.stderr.write("Usage: kb [list|create|delete] [...args]\n")
      process.exit(1)
    }
  },
}
