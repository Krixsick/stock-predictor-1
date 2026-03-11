import type { StockDataPoint, Prediction, ModelMetricsData, IndicatorData } from './types'

const BASE = '/api'

export async function fetchTickers(): Promise<string[]> {
  const res = await fetch(`${BASE}/tickers`)
  return res.json()
}

export async function fetchHistory(ticker: string, days?: number): Promise<StockDataPoint[]> {
  const params = new URLSearchParams({ ticker })
  if (days) params.set('days', String(days))
  const res = await fetch(`${BASE}/stock/history?${params}`)
  return res.json()
}

export async function fetchPrediction(ticker: string): Promise<Prediction> {
  const res = await fetch(`${BASE}/stock/prediction?ticker=${ticker}`)
  return res.json()
}

export async function fetchMetrics(ticker: string): Promise<ModelMetricsData> {
  const res = await fetch(`${BASE}/model/metrics?ticker=${ticker}`)
  return res.json()
}

export async function fetchIndicators(ticker: string, days = 252): Promise<IndicatorData> {
  const res = await fetch(`${BASE}/stock/indicators?ticker=${ticker}&days=${days}`)
  return res.json()
}

export async function refreshData(ticker: string): Promise<{ status: string; rows: number; accuracy: number }> {
  const res = await fetch(`${BASE}/stock/refresh?ticker=${ticker}`, { method: 'POST' })
  return res.json()
}
