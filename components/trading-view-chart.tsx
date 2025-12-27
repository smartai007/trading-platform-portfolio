"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    TradingView: any
  }
}

export function TradingViewChart() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "NASDAQ:AAPL",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0a0a0a",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          backgroundColor: "#0f0f0f",
          gridColor: "#1a1a1a",
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return <div id="tradingview_chart" ref={containerRef} className="h-full w-full rounded-lg" />
}
