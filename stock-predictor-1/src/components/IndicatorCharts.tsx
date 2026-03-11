import { useEffect, useRef } from 'react'
import { createChart, LineSeries, HistogramSeries } from 'lightweight-charts'
import type { IChartApi } from 'lightweight-charts'
import { useIndicators } from '../hooks/useStockData'

const CHART_OPTS = {
  layout: {
    background: { color: '#111827' },
    textColor: '#9ca3af',
    fontSize: 11,
  },
  grid: {
    vertLines: { color: '#1f293744' },
    horzLines: { color: '#1f293744' },
  },
  crosshair: { mode: 0 as const },
  timeScale: { timeVisible: false, borderColor: '#1f2937' },
  rightPriceScale: { borderColor: '#1f2937' },
}

function RSIChart({ data }: { data: { date: string; value: number }[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const chart = createChart(containerRef.current, {
      ...CHART_OPTS,
      width: containerRef.current.clientWidth,
      height: 150,
    })
    chartRef.current = chart

    const series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2 })
    series.setData(data.map((d) => ({ time: d.date, value: d.value })))

    const overbought = chart.addSeries(LineSeries, {
      color: '#ef444466', lineWidth: 1, lineStyle: 2,
      crosshairMarkerVisible: false, lastValueVisible: false, priceLineVisible: false,
    })
    overbought.setData(data.map((d) => ({ time: d.date, value: 70 })))

    const oversold = chart.addSeries(LineSeries, {
      color: '#10b98166', lineWidth: 1, lineStyle: 2,
      crosshairMarkerVisible: false, lastValueVisible: false, priceLineVisible: false,
    })
    oversold.setData(data.map((d) => ({ time: d.date, value: 30 })))

    chart.timeScale().fitContent()

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (chartRef.current) chart.applyOptions({ width: e.contentRect.width })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [data])

  return (
    <div>
      <p className="text-xs text-text-muted mb-1">RSI (14)</p>
      <div ref={containerRef} />
    </div>
  )
}

function MACDChart({ data }: { data: { date: string; line: number; signal: number; histogram: number }[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const chart = createChart(containerRef.current, {
      ...CHART_OPTS,
      width: containerRef.current.clientWidth,
      height: 150,
    })
    chartRef.current = chart

    const histSeries = chart.addSeries(HistogramSeries, { priceScaleId: 'macd' })
    histSeries.setData(
      data.map((d) => ({
        time: d.date, value: d.histogram,
        color: d.histogram >= 0 ? '#10b98188' : '#ef444488',
      }))
    )

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6', lineWidth: 2, priceScaleId: 'macd',
    })
    lineSeries.setData(data.map((d) => ({ time: d.date, value: d.line })))

    const signalSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b', lineWidth: 1, priceScaleId: 'macd',
    })
    signalSeries.setData(data.map((d) => ({ time: d.date, value: d.signal })))

    chart.timeScale().fitContent()

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (chartRef.current) chart.applyOptions({ width: e.contentRect.width })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [data])

  return (
    <div>
      <p className="text-xs text-text-muted mb-1">MACD</p>
      <div ref={containerRef} />
    </div>
  )
}

function BollingerChart({ data }: { data: { date: string; upper: number; lower: number; close: number }[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const chart = createChart(containerRef.current, {
      ...CHART_OPTS,
      width: containerRef.current.clientWidth,
      height: 150,
    })
    chartRef.current = chart

    const closeSeries = chart.addSeries(LineSeries, { color: '#f9fafb', lineWidth: 2 })
    closeSeries.setData(data.map((d) => ({ time: d.date, value: d.close })))

    const upperSeries = chart.addSeries(LineSeries, {
      color: '#3b82f644', lineWidth: 1,
      crosshairMarkerVisible: false, lastValueVisible: false, priceLineVisible: false,
    })
    upperSeries.setData(data.map((d) => ({ time: d.date, value: d.upper })))

    const lowerSeries = chart.addSeries(LineSeries, {
      color: '#3b82f644', lineWidth: 1,
      crosshairMarkerVisible: false, lastValueVisible: false, priceLineVisible: false,
    })
    lowerSeries.setData(data.map((d) => ({ time: d.date, value: d.lower })))

    chart.timeScale().fitContent()

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (chartRef.current) chart.applyOptions({ width: e.contentRect.width })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [data])

  return (
    <div>
      <p className="text-xs text-text-muted mb-1">Bollinger Bands</p>
      <div ref={containerRef} />
    </div>
  )
}

export function IndicatorCharts({ ticker }: { ticker: string }) {
  const { data, isLoading } = useIndicators(ticker)

  if (isLoading || !data) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-4 h-full">
        <h2 className="text-sm font-medium text-text-secondary mb-3">Technical Indicators</h2>
        <div className="h-[450px] flex items-center justify-center">
          <p className="text-text-muted animate-pulse">Loading indicators...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-medium text-text-secondary">Technical Indicators</h2>
      <RSIChart data={data.rsi} />
      <MACDChart data={data.macd} />
      <BollingerChart data={data.bollinger} />
    </div>
  )
}
