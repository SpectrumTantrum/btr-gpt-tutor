import type { Message } from "@/lib/core/types"
import { MarkdownRenderer } from "@/components/common/markdown-renderer"

interface MessageBubbleProps {
  message: Message
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const time = formatTime(message.createdAt)

  if (isUser) {
    return (
      <section className="reading-column" aria-label="Your question">
        <header className="flex items-baseline gap-3">
          <span className="eyebrow">You asked</span>
          <span className="h-px flex-1 bg-border/70" />
          <time className="font-sans text-[0.6875rem] tabular-nums text-muted-foreground/80">
            {time}
          </time>
        </header>
        <p className="mt-3 whitespace-pre-wrap font-serif text-[1.0625rem] leading-[1.7] text-foreground/90">
          {message.content}
        </p>
      </section>
    )
  }

  const citations = message.citations ?? []
  const hasCitations = citations.length > 0

  return (
    <article className="reading-column" aria-label="Response">
      <header className="flex items-baseline gap-3">
        <span className="eyebrow text-primary">Response</span>
        <span className="h-px flex-1 bg-border/70" />
      </header>

      <div className="academic-body mt-4 font-serif text-[1.0625rem] leading-[1.75] text-foreground [&_p]:mb-4 [&_p:last-child]:mb-0 [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:mt-8 [&_h2]:mt-6 [&_h3]:mt-5 [&_h1]:mb-3 [&_h2]:mb-2 [&_h3]:mb-2 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-[3px] [&_a]:decoration-primary/40 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:bg-muted [&_code]:px-[0.3em] [&_code]:py-[0.1em] [&_code]:rounded-sm [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:my-4 [&_pre]:rounded-sm [&_pre]:border [&_pre]:border-border [&_pre]:font-mono [&_pre]:text-[0.875rem] [&_pre]:leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1">
        <MarkdownRenderer content={message.content} />
      </div>

      {hasCitations && (
        <footer className="mt-8">
          <div className="rule-fleuron">
            <span>§&nbsp;&nbsp;sources&nbsp;&nbsp;§</span>
          </div>
          <ol className="mt-4 space-y-3">
            {citations.map((citation, idx) => (
              <li
                key={citation.chunkId}
                className="flex items-baseline gap-3 font-sans text-[0.8125rem] text-muted-foreground"
              >
                <span className="font-serif text-primary tabular-nums min-w-[1.5rem]">
                  {idx + 1}.
                </span>
                <span className="flex-1 leading-relaxed">
                  <span className="font-serif italic text-foreground/80">
                    {citation.documentName}
                  </span>
                  {citation.content && (
                    <span className="mt-1 block text-muted-foreground/80">
                      &ldquo;{truncate(citation.content, 160)}&rdquo;
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </footer>
      )}

      <div className="mt-6 flex items-baseline justify-end">
        <time className="font-sans text-[0.6875rem] tabular-nums text-muted-foreground/70">
          {time}
        </time>
      </div>
    </article>
  )
}
