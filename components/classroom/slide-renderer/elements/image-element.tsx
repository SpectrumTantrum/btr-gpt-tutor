import type { SlideElement } from "@/lib/core/types"

interface ImageElementProps {
  element: SlideElement
  containerWidth: number
  containerHeight: number
}

const DESIGN_WIDTH = 1000
const DESIGN_HEIGHT = 562

export function ImageElement({ element, containerWidth, containerHeight }: ImageElementProps) {
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

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={element.content}
      alt=""
      style={style}
      className="object-contain"
    />
  )
}
