import type { AgentConfig } from "@/lib/core/types"
import { AgentAvatar } from "./agent-avatar"
import { cn } from "@/lib/utils"

interface AgentInfoBarProps {
  agent: AgentConfig | null
  isActive: boolean
}

export function AgentInfoBar({ agent, isActive }: AgentInfoBarProps) {
  if (!agent) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
      <AgentAvatar agent={agent} size="sm" />

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{agent.name}</span>
        <span className="capitalize text-xs text-muted-foreground">{agent.role}</span>
      </div>

      {isActive && (
        <div className="ml-auto flex items-end gap-[3px]" aria-label="Speaking">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn("inline-block w-[3px] rounded-full bg-primary animate-bounce")}
              style={{
                height: i === 1 ? 14 : 10,
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
