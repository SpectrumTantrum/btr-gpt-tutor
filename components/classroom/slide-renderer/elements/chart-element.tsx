"use client"

import { useEffect, useRef } from "react"
import type { SlideElement } from "@/lib/core/types"

interface ChartElementProps {
  element: SlideElement
  containerWidth: number
  containerHeight: number
}

const DESIGN_WIDTH = 1000
const DESIGN_HEIGHT = 562

export function ChartElement({ element, containerWidth, containerHeight }: ChartElementProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const scaleX = containerWidth / DESIGN_WIDTH
  const scaleY = containerHeight / DESIGN_HEIGHT

  useEffect(() => {
    if (!chartRef.current) return

    let chart: { setOption: (opts: unknown) => void; dispose: () => void } | null = null

    async function initChart() {
      const echarts = await import("echarts")
      if (!chartRef.current) return

      chart = echarts.init(chartRef.current)

      try {
        const options: unknown = JSON.parse(element.content)
        chart.setOption(options)
      } catch {
        chart.setOption({ title: { text: "Invalid chart data" } })
      }
    }

    void initChart()

    return () => {
      chart?.dispose()
    }
  }, [element.content])

  const style: React.CSSProperties = {
    position: "absolute",
    left: element.x * scaleX,
    top: element.y * scaleY,
    width: element.width * scaleX,
    height: element.height * scaleY,
    ...element.style,
  }

  return <div ref={chartRef} style={style} />
}
