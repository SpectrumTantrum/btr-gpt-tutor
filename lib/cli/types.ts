export type OutputFormat = "rich" | "json"

export interface CLIContext {
  readonly format: OutputFormat
  readonly baseUrl: string
}

export interface CLICommand {
  readonly name: string
  readonly description: string
  execute(args: readonly string[], ctx: CLIContext): Promise<void>
}
