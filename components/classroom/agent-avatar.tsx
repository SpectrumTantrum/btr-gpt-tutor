import type { AgentConfig } from "@/lib/core/types"
import { cn } from "@/lib/utils"

interface AgentAvatarProps {
  agent: AgentConfig
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<AgentAvatarProps["size"]>, string> = {
  sm: "size-8 text-sm",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
}

export function AgentAvatar({ agent, size = "md", className }: AgentAvatarProps) {
  const sizeClass = SIZE_CLASSES[size]
  const fallbackLetter = agent.name.charAt(0).toUpperCase()

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/20 font-semibold text-primary ring-2 ring-primary/30 overflow-hidden",
          sizeClass
        )}
      >
        {agent.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={agent.avatarUrl}
            alt={agent.name}
            className="size-full object-cover"
          />
        ) : (
          fallbackLetter
        )}
      </div>
      <span className="max-w-[80px] truncate text-center text-xs text-muted-foreground">
        {agent.name}
      </span>
    </div>
  )
}
