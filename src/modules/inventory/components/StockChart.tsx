import { useMemo, useState } from 'react'
import { formatNumber } from '@/lib/format'
import type { StockPoint } from '@/modules/inventory/types/inventory.types'

interface StockChartProps {
  points: StockPoint[]
  minStock: number
  unit: string
}

const W = 460
const H = 168
const PAD = { top: 12, right: 12, bottom: 22, left: 34 }

export function StockChart({ points, minStock, unit }: StockChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const { path, area, xs, y, ticks } = useMemo(() => {
    const max = Math.max(minStock * 1.5, ...points.map((p) => p.stock), 1)
    const niceMax = Math.ceil(max / 10) * 10
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const xs = points.map((_, i) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW))
    const y = (v: number) => PAD.top + innerH - (v / niceMax) * innerH
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)},${y(p.stock).toFixed(1)}`).join('')
    const area = `${line}L${xs[xs.length - 1].toFixed(1)},${y(0)}L${xs[0].toFixed(1)},${y(0)}Z`
    return { path: line, area, xs, y, ticks: [0, niceMax / 2, niceMax] }
  }, [points, minStock])

  if (!points.length) return null
  const active = hover !== null ? points[hover] : null
  const label = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label={`Tồn kho 30 ngày, hiện tại ${points[points.length - 1].stock} ${unit}`}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * W
          let nearest = 0
          xs.forEach((px, i) => Math.abs(px - x) < Math.abs(xs[nearest] - x) && (nearest = i))
          setHover(nearest)
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="stock-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#f1f5f9" />
            <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[10px]">
              {formatNumber(t)}
            </text>
          </g>
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(minStock)} y2={y(minStock)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={W - PAD.right} y={y(minStock) - 4} textAnchor="end" className="fill-amber-600 text-[10px] font-semibold">
          Tối thiểu {minStock}
        </text>
        <path d={area} fill="url(#stock-fill)" />
        <path d={path} fill="none" stroke="#16a34a" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].map((i) => (
          <text key={i} x={xs[i]} y={H - 6} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} className="fill-slate-400 text-[10px]">
            {label(points[i].date)}
          </text>
        ))}
        {active && hover !== null && (
          <g>
            <line x1={xs[hover]} x2={xs[hover]} y1={PAD.top} y2={y(0)} stroke="#cbd5e1" strokeDasharray="3 3" />
            <circle cx={xs[hover]} cy={y(active.stock)} r={5} fill="#16a34a" stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg"
          style={{ left: `${(xs[hover] / W) * 100}%` }}
        >
          <span className="text-slate-300">{label(active.date)}: </span>
          <span className="font-bold">
            {formatNumber(active.stock)} {unit.toLowerCase()}
          </span>
        </div>
      )}
    </div>
  )
}
