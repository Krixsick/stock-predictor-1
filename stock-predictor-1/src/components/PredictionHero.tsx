import { TrendingUp, TrendingDown } from 'lucide-react'
import { usePrediction } from '../hooks/useStockData'

export function PredictionHero({ ticker }: { ticker: string }) {
  const { data, isLoading } = usePrediction(ticker)

  if (isLoading || !data) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 h-full flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  const isUp = data.direction === 'up'
  const probability = isUp ? data.probability_up : data.probability_down
  const Icon = isUp ? TrendingUp : TrendingDown

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6 h-full flex flex-col items-center justify-center gap-4">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">5-Day Outlook</p>

      {/* Glowing circle */}
      <div
        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
          isUp
            ? 'bg-accent-green/15 shadow-[0_0_40px_rgba(16,185,129,0.25)]'
            : 'bg-accent-red/15 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
        }`}
      >
        <Icon
          size={48}
          className={isUp ? 'text-accent-green' : 'text-accent-red'}
        />
      </div>

      {/* Probability */}
      <div className="text-center">
        <p className={`text-3xl font-bold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
          {(probability * 100).toFixed(1)}%
        </p>
        <p className={`text-lg font-semibold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
          {isUp ? 'BULLISH' : 'BEARISH'}
        </p>
      </div>

      {/* Price */}
      <div className="text-center mt-2">
        <p className="text-xs text-text-muted">Current Price</p>
        <p className="text-xl font-semibold text-text-primary">
          ${data.close_price.toFixed(2)}
        </p>
        <p className="text-xs text-text-muted mt-1">{data.date}</p>
      </div>
    </div>
  )
}
