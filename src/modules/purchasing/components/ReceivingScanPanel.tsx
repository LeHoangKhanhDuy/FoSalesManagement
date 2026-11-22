import { useState } from 'react'
import { CircleAlert, CircleCheck, Keyboard, ScanBarcode, TriangleAlert, Undo2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ScanFlash } from '@/modules/purchasing/hooks/useReceiving'
import type { ReceivingScan } from '@/modules/purchasing/types/purchasing.types'
import type { summarizeReceiving } from '@/modules/purchasing/utils/receiving.utils'

interface Props {
  flash: ScanFlash | null
  scans: ReceivingScan[]
  summary: ReturnType<typeof summarizeReceiving>
  onManualCode: (code: string) => void
  onUndo: () => void
}

const FLASH_STYLE = {
  success: { box: 'bg-primary-600 text-white', icon: CircleCheck },
  complete: { box: 'bg-primary-700 text-white', icon: CircleCheck },
  warning: { box: 'bg-amber-500 text-white', icon: TriangleAlert },
  error: { box: 'bg-rose-600 text-white', icon: CircleAlert },
}

const RESULT_DOT = { ok: 'bg-primary-500', complete: 'bg-primary-700', over: 'bg-amber-500', extra: 'bg-rose-500' }

export function ReceivingScanPanel({ flash, scans, summary, onManualCode, onUndo }: Props) {
  const [code, setCode] = useState('')
  const percent = summary.expected ? Math.min(100, Math.round((Math.min(summary.scanned - summary.extra, summary.expected) / summary.expected) * 100)) : 0
  const style = flash ? FLASH_STYLE[flash.tone] : null
  const Icon = style?.icon ?? ScanBarcode

  return (
    <aside className="flex w-[340px] shrink-0 flex-col gap-3">
      <div key={flash?.key} className={cn('rounded-lg p-5 transition-colors', style ? cn(style.box, 'animate-scale-in') : 'border-2 border-dashed border-slate-200 bg-white text-slate-500')}>
        <Icon className={cn('size-8', !style && 'animate-pulse text-primary-500')} />
        <p className="mt-3 text-lg leading-tight font-bold">{flash?.title ?? 'Sẵn sàng quét'}</p>
        <p className={cn('mt-1 text-sm', style ? 'text-white/85' : 'text-slate-400')}>{flash?.detail ?? 'Quét mã vạch sản phẩm bằng máy quét — không cần bấm vào ô nhập'}</p>
      </div>

      <div className="rounded-lg bg-white p-4">
        <div className="flex items-end justify-between">
          <p className="text-sm font-semibold text-slate-700">Tiến độ kiểm đếm</p>
          <p className="text-2xl font-extrabold text-slate-900">{percent}%</p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
          {[
            ['Dòng đủ', `${summary.complete}/${summary.total}`, 'text-primary-600'],
            ['Thiếu', summary.shortage, 'text-amber-600'],
            ['Thừa', summary.over + summary.extra, 'text-rose-500'],
            ['Hỏng', summary.damaged, 'text-rose-500'],
          ].map(([l, v, c]) => (
            <div key={l} className="rounded-md bg-slate-50 py-1.5">
              <p className={cn('text-base font-bold', c)}>{v}</p>
              <p className="text-[10px] text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onManualCode(code)
          setCode('')
        }}
        className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white pr-1 pl-3 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100"
      >
        <Keyboard className="size-4 text-slate-400" />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nhập mã thủ công + Enter" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </form>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Lượt quét gần đây</p>
          <button type="button" onClick={onUndo} disabled={!scans.length} className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-40">
            <Undo2 className="size-3.5" /> Hoàn tác
          </button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {scans.slice(0, 15).map((s) => (
            <li key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs">
              <span className={cn('size-1.5 shrink-0 rounded-full', RESULT_DOT[s.result])} />
              <span className="min-w-0 flex-1 truncate text-slate-700">{s.name}</span>
              <span className="font-bold text-slate-900">+{s.quantity}</span>
              <span className="text-slate-400">{new Date(s.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </li>
          ))}
          {!scans.length && <li className="py-6 text-center text-xs text-slate-400">Chưa có lượt quét</li>}
        </ul>
      </div>
    </aside>
  )
}
