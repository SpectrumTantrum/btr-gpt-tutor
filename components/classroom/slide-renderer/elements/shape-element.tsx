import type { SlideElement } from "@/lib/core/types"

interface ShapeElementProps {
  element: SlideElement
  containerWidth: number
  containerHeight: number
}

const DESIGN_WIDTH = 1000
const DESIGN_HEIGHT = 562

export function ShapeElement({ element, containerWidth, containerHeight }: ShapeElementProps) {
  const scaleX = containerWidth / DESIGN_WIDTH
  const scaleY = containerHeight / DESIGN_HEIGHT

  const isCircle = element.content === "circle"

  const style: React.CSSProperties = {
    position: "absolute",
    left: element.x * scaleX,
    top: element.y * scaleY,
    width: element.width * scaleX,
    height: element.height * scaleY,
    borderRadius: isCircle ? "50%" : undefined,
    backgroundColor: element.style?.backgroundColor ?? "#6366f1",
    ...element.style,
  }

  return <div style={style} />
}
