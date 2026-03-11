import { DollarSign, BarChart3, Activity, Waves } from 'lucide-react'
import { useHistory, useIndicators } from '../hooks/useStockData'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color?: string
}

function StatCard({ icon, label, value, sub, color = 'text-text-primary' }: StatCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-bg-card-hover text-text-secondary">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold ${color} mt-0.5`}>{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function StatsBar({ ticker }: { ticker: string }) {
  const { data: history } = useHistory(ticker, 30)
  const { data: indicators } = useIndicators(ticker, 30)

  if (!history || !indicators) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-bg-card border border-border rounded-xl p-4 animate-pulse" />
        ))}
      </div>
    )
  }

  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  const change = prev ? ((latest.close - prev.close) / prev.close * 100) : 0
  const changeStr = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`

  const latestRsi = indicators.rsi[indicators.rsi.length - 1]?.value ?? 0
  const rsiColor = latestRsi > 70 ? 'text-accent-red' : latestRsi < 30 ? 'text-accent-green' : 'text-text-primary'

  const avgVol = history.reduce((sum, d) => sum + d.volume, 0) / history.length
  const volRatio = latest.volume / avgVol

  const latestMacd = indicators.macd[indicators.macd.length - 1]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      <StatCard
        icon={<DollarSign size={18} />}
        label="Price"
        value={`$${latest.close.toFixed(2)}`}
        sub={changeStr}
        color={change >= 0 ? 'text-accent-green' : 'text-accent-red'}
      />
      <StatCard
        icon={<BarChart3 size={18} />}
        label="Volume"
        value={latest.volume.toLocaleString()}
        sub={`${volRatio.toFixed(2)}x avg`}
      />
      <StatCard
        icon={<Activity size={18} />}
        label="RSI (14)"
        value={latestRsi.toFixed(1)}
        sub={latestRsi > 70 ? 'Overbought' : latestRsi < 30 ? 'Oversold' : 'Neutral'}
        color={rsiColor}
      />
      <StatCard
        icon={<Waves size={18} />}
        label="MACD"
        value={latestMacd?.line.toFixed(4) ?? '—'}
        sub={`Signal: ${latestMacd?.signal.toFixed(4) ?? '—'}`}
        color={latestMacd && latestMacd.histogram > 0 ? 'text-accent-green' : 'text-accent-red'}
      />
    </div>
  )
}
