import type { Message } from "@/lib/core/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/common/markdown-renderer"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.citations.map((citation) => (
              <Badge
                key={citation.chunkId}
                variant="secondary"
                className="max-w-[200px] truncate text-xs"
                title={citation.documentName}
              >
                {citation.documentName}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
