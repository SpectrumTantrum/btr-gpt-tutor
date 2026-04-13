"use client"

import { useRef, useState, useEffect } from "react"
import type { SlideData, SlideElement } from "@/lib/core/types"
import { TextElement } from "./elements/text-element"
import { ImageElement } from "./elements/image-element"
import { ShapeElement } from "./elements/shape-element"
import { ChartElement } from "./elements/chart-element"

interface SlideCanvasProps {
  slide: SlideData
}

export function SlideCanvas({ slide }: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg"
      style={{
        aspectRatio: "16 / 9",
        backgroundColor: slide.background ?? "#ffffff",
      }}
    >
      {dimensions.width > 0 &&
        slide.elements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
          />
        ))}
    </div>
  )
}

interface ElementRendererProps {
  element: SlideElement
  containerWidth: number
  containerHeight: number
}

function ElementRenderer({ element, containerWidth, containerHeight }: ElementRendererProps) {
  const props = { element, containerWidth, containerHeight }

  switch (element.type) {
    case "text":
    case "latex":
      return <TextElement {...props} />
    case "image":
      return <ImageElement {...props} />
    case "shape":
      return <ShapeElement {...props} />
    case "chart":
      return <ChartElement {...props} />
    default:
      return null
  }
}
