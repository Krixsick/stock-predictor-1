import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import type { IChartApi } from 'lightweight-charts'
import { useHistory } from '../hooks/useStockData'

export function PriceChart({ ticker }: { ticker: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const { data, isLoading } = useHistory(ticker)

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#111827' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f293766' },
        horzLines: { color: '#1f293766' },
      },
      width: containerRef.current.clientWidth,
      height: 400,
      crosshair: { mode: 0 },
      timeScale: {
        timeVisible: false,
        borderColor: '#1f2937',
      },
      rightPriceScale: {
        borderColor: '#1f2937',
      },
    })

    chartRef.current = chart

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    const candleData = data.map((d) => ({
      time: d.date as string,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))
    candleSeries.setData(candleData)

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    const volumeData = data.map((d) => ({
      time: d.date as string,
      value: d.volume,
      color: d.close >= d.open ? '#10b98133' : '#ef444433',
    }))
    volumeSeries.setData(volumeData)

    chart.timeScale().fitContent()

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width })
      }
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [data])

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <h2 className="text-sm font-medium text-text-secondary mb-3">
        {ticker}.TO — Price History
      </h2>
      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-text-muted animate-pulse">Loading chart...</p>
        </div>
      ) : (
        <div ref={containerRef} />
      )}
    </div>
  )
}
