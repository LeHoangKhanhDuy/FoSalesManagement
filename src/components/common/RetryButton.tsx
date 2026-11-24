import { RefreshCw } from 'lucide-react'

export function RetryButton({ onClick, label = 'Thử lại' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
    >
      <RefreshCw className="size-4" /> {label}
    </button>
  )
}
