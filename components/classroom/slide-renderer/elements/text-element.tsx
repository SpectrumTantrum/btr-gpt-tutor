import type { SlideElement } from "@/lib/core/types"

interface TextElementProps {
  element: SlideElement
  containerWidth: number
  containerHeight: number
}

const DESIGN_WIDTH = 1000
const DESIGN_HEIGHT = 562

export function TextElement({ element, containerWidth, containerHeight }: TextElementProps) {
  const scaleX = containerWidth / DESIGN_WIDTH
  const scaleY = containerHeight / DESIGN_HEIGHT

  const style: React.CSSProperties = {
    position: "absolute",
    left: element.x * scaleX,
    top: element.y * scaleY,
    width: element.width * scaleX,
    height: element.height * scaleY,
    ...element.style,
  }

  const rendered = renderMarkdownInline(element.content)

  return (
    <div style={style} className="overflow-hidden">
      <span dangerouslySetInnerHTML={{ __html: rendered }} />
    </div>
  )
}

function renderMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />")
}
