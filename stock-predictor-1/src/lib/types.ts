export interface StockDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Prediction {
  prediction: number
  direction: 'up' | 'down'
  probability_up: number
  probability_down: number
  date: string
  close_price: number
}

export interface ModelMetricsData {
  accuracy: number
  confusion_matrix: number[][]
  classification_report: Record<string, Record<string, number>>
  cv_mean: number
  cv_std: number
  cv_folds: number[]
  train_size: number
  test_size: number
}

export interface IndicatorData {
  rsi: { date: string; value: number }[]
  macd: { date: string; line: number; signal: number; histogram: number }[]
  bollinger: { date: string; upper: number; lower: number; close: number }[]
}
