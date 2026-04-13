import type { HeartbeatConfig } from "@/lib/core/types"

export class HeartbeatManager {
  private readonly config: HeartbeatConfig
  private readonly onTick: () => Promise<void>
  private intervalId: ReturnType<typeof setInterval> | null = null
  private nextTickAt: number = 0

  constructor(config: HeartbeatConfig, onTick: () => Promise<void>) {
    this.config = config
    this.onTick = onTick
  }

  start(): void {
    if (this.intervalId !== null) {
      return
    }

    this.nextTickAt = Date.now() + this.config.intervalMs
    this.intervalId = setInterval(() => {
      this.nextTickAt = Date.now() + this.config.intervalMs
      void this.onTick()
    }, this.config.intervalMs)
  }

  stop(): void {
    if (this.intervalId === null) {
      return
    }

    clearInterval(this.intervalId)
    this.intervalId = null
    this.nextTickAt = 0
  }

  isRunning(): boolean {
    return this.intervalId !== null
  }

  getNextTickAt(): number {
    return this.nextTickAt
  }
}
