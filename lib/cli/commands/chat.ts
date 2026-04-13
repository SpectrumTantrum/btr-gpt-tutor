import type { CLICommand, CLIContext } from "../types"

export const chatCommand: CLICommand = {
  name: "chat",
  description: "Send a message to the tutor and stream the response",

  async execute(args: readonly string[], ctx: CLIContext): Promise<void> {
    const message = args.join(" ")

    if (!message) {
      process.stderr.write("Error: message text is required\n")
      process.exit(1)
    }

    const url = `${ctx.baseUrl}/api/chat`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      process.stderr.write(`Error: ${response.status} ${response.statusText}\n`)
      process.exit(1)
    }

    if (!response.body) {
      process.stderr.write("Error: empty response body\n")
      process.exit(1)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })

      if (ctx.format === "json") {
        process.stdout.write(JSON.stringify({ chunk }) + "\n")
      } else {
        process.stdout.write(chunk)
      }
    }

    if (ctx.format === "rich") {
      process.stdout.write("\n")
    }
  },
}
