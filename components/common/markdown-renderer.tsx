"use client"

interface MarkdownRendererProps {
  content: string
  className?: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function renderInline(text: string): string {
  const escaped = escapeHtml(text)
  // Order matters: bold before italic
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm font-mono">$1</code>')
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const paragraphs = content.split(/\n\n+/)

  return (
    <div className={className}>
      {paragraphs.map((para, index) => {
        const trimmed = para.trim()
        if (!trimmed) return null
        return (
          <p
            key={index}
            className="mb-3 last:mb-0 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }}
          />
        )
      })}
    </div>
  )
}
