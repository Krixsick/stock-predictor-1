import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRefresh } from '../hooks/useStockData'
import { PredictionHero } from './PredictionHero'
import { StatsBar } from './StatsBar'
import { PriceChart } from './PriceChart'
import { IndicatorCharts } from './IndicatorCharts'
import { ModelMetrics } from './ModelMetrics'

const TICKERS = ['VFV', 'VCN', 'VSP', 'XIC', 'XUS', 'XIU']

export function Dashboard() {
  const [activeTicker, setActiveTicker] = useState('VFV')
  const refresh = useRefresh()

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Stock Predictor</h1>
          <p className="text-sm text-text-muted mt-1">Canadian ETF 5-day direction forecast</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTicker(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTicker === t
                  ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/25'
                  : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover hover:text-text-primary border border-border'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => refresh.mutate(activeTicker)}
            disabled={refresh.isPending}
            className="ml-2 p-2 rounded-lg bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-all disabled:opacity-50"
            title="Refresh data from Yahoo Finance"
          >
            <RefreshCw size={16} className={refresh.isPending ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Prediction + Stats */}
        <div className="col-span-12 lg:col-span-3">
          <PredictionHero ticker={activeTicker} />
        </div>
        <div className="col-span-12 lg:col-span-9">
          <StatsBar ticker={activeTicker} />
        </div>

        {/* Price Chart */}
        <div className="col-span-12">
          <PriceChart ticker={activeTicker} />
        </div>

        {/* Indicators + Metrics */}
        <div className="col-span-12 lg:col-span-7">
          <IndicatorCharts ticker={activeTicker} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ModelMetrics ticker={activeTicker} />
        </div>
      </div>
    </div>
  )
}
