import { Fragment } from 'react'
import { useMetrics } from '../hooks/useStockData'

function AccuracyGauge({ accuracy }: { accuracy: number }) {
  const pct = accuracy * 100
  const angle = (pct / 100) * 180
  const radians = (angle - 180) * (Math.PI / 180)
  const x = 60 + 45 * Math.cos(radians)
  const y = 60 + 45 * Math.sin(radians)

  // Arc path for the filled portion
  const startX = 60 - 45
  const startY = 60
  const largeArc = angle > 180 ? 1 : 0

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-40">
        {/* Background arc */}
        <path
          d="M 15 60 A 45 45 0 0 1 105 60"
          fill="none"
          stroke="#1f2937"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${startX} ${startY} A 45 45 0 ${largeArc} 1 ${x} ${y}`}
          fill="none"
          stroke={pct >= 55 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <text x="60" y="58" textAnchor="middle" fill="#f9fafb" fontSize="18" fontWeight="bold">
          {pct.toFixed(1)}%
        </text>
      </svg>
      <p className="text-xs text-text-muted -mt-1">Test Accuracy</p>
    </div>
  )
}

function ConfusionMatrix({ matrix }: { matrix: number[][] }) {
  const maxVal = Math.max(...matrix.flat())
  const labels = ['Down', 'Up']

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">Confusion Matrix</p>
      <div className="grid grid-cols-3 gap-1 text-center text-xs">
        {[
          <div key="h-empty" />,
          <div key="h-down" className="text-text-muted py-1">Pred Down</div>,
          <div key="h-up" className="text-text-muted py-1">Pred Up</div>,
          ...matrix.flatMap((row, i) => [
            <div key={`label-${i}`} className="text-text-muted py-2 text-right pr-2">
              {labels[i]}
            </div>,
            ...row.map((val, j) => {
              const opacity = maxVal > 0 ? val / maxVal : 0
              const isCorrect = i === j
              return (
                <div
                  key={`cell-${i}-${j}`}
                  className="py-2 rounded-md font-mono font-medium"
                  style={{
                    backgroundColor: isCorrect
                      ? `rgba(16, 185, 129, ${opacity * 0.4})`
                      : `rgba(239, 68, 68, ${opacity * 0.4})`,
                    color: '#f9fafb',
                  }}
                >
                  {val}
                </div>
              )
            }),
          ]),
        ]}
      </div>
    </div>
  )
}

function CVScores({ folds, mean, std }: { folds: number[]; mean: number; std: number }) {
  const max = Math.max(...folds)

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">
        Cross-Validation ({folds.length}-fold) — {(mean * 100).toFixed(1)}% ± {(std * 100).toFixed(1)}%
      </p>
      <div className="flex items-end gap-1 h-16">
        {folds.map((score, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-muted">{(score * 100).toFixed(0)}%</span>
            <div
              className="w-full rounded-sm bg-accent-blue/60"
              style={{ height: `${(score / max) * 40}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function ClassReport({ report }: { report: Record<string, Record<string, number>> }) {
  const classes = ['Down', 'Up']

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">Classification Report</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="text-left py-1">Class</th>
            <th className="text-right py-1">Precision</th>
            <th className="text-right py-1">Recall</th>
            <th className="text-right py-1">F1</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => {
            const r = report[cls]
            if (!r) return null
            return (
              <tr key={cls} className="border-t border-border">
                <td className="py-1.5 font-medium">{cls}</td>
                <td className="text-right py-1.5">{(r.precision * 100).toFixed(1)}%</td>
                <td className="text-right py-1.5">{(r.recall * 100).toFixed(1)}%</td>
                <td className="text-right py-1.5">{(r['f1-score'] * 100).toFixed(1)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ModelMetrics({ ticker }: { ticker: string }) {
  const { data, isLoading } = useMetrics(ticker)

  if (isLoading || !data) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-4 h-full">
        <h2 className="text-sm font-medium text-text-secondary mb-3">Model Performance</h2>
        <div className="h-[450px] flex items-center justify-center">
          <p className="text-text-muted animate-pulse">Loading metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 space-y-5">
      <h2 className="text-sm font-medium text-text-secondary">Model Performance</h2>

      <AccuracyGauge accuracy={data.accuracy} />

      <div className="flex gap-3 text-center text-xs text-text-muted">
        <div className="flex-1 bg-bg-card-hover rounded-lg p-2">
          <p className="text-text-primary font-bold text-lg">{data.train_size}</p>
          <p>Train samples</p>
        </div>
        <div className="flex-1 bg-bg-card-hover rounded-lg p-2">
          <p className="text-text-primary font-bold text-lg">{data.test_size}</p>
          <p>Test samples</p>
        </div>
      </div>

      <ConfusionMatrix matrix={data.confusion_matrix} />
      <CVScores folds={data.cv_folds} mean={data.cv_mean} std={data.cv_std} />
      <ClassReport report={data.classification_report} />
    </div>
  )
}
