"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import * as echarts from "echarts"
import type { EChartsOption } from "echarts"

interface ChartRendererProps {
  option: EChartsOption
  className?: string
}

export function ChartRenderer({ option, className }: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    const theme = resolvedTheme === "dark" ? "dark" : undefined

    if (chartRef.current) {
      chartRef.current.dispose()
    }

    chartRef.current = echarts.init(containerRef.current, theme, {
      renderer: "canvas",
    })

    chartRef.current.setOption(option)

    function handleResize() {
      chartRef.current?.resize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [option, resolvedTheme])

  return (
    <div
      ref={containerRef}
      className={className ?? "w-full h-64"}
    />
  )
}
