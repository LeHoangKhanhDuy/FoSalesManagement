import { Boxes, History, RefreshCw, Truck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { AdjustStockModal } from '@/modules/inventory/components/AdjustStockModal'
import { InventoryStats } from '@/modules/inventory/components/InventoryStats'
import { MovementHistory } from '@/modules/inventory/components/MovementHistory'
import { StockDetailDrawer } from '@/modules/inventory/components/StockDetailDrawer'
import { StockFilters } from '@/modules/inventory/components/StockFilters'
import { StockTable } from '@/modules/inventory/components/StockTable'
import { useInventoryPage, type InventoryTab } from '@/modules/inventory/hooks/useInventoryPage'
import { PurchaseOrdersPanel } from '@/modules/purchasing/components/PurchaseOrdersPanel'

const TABS: { value: InventoryTab; label: string; icon: LucideIcon }[] = [
  { value: 'stock', label: 'Tồn kho hiện tại', icon: Boxes },
  { value: 'purchasing', label: 'Nhập hàng', icon: Truck },
  { value: 'history', label: 'Lịch sử xuất nhập', icon: History },
]

export default function InventoryPage() {
  const {
    tab,
    setTab,
    data,
    stock,
    history,
    purchasing,
    detail,
    detailMovements,
    openDetail,
    closeDetail,
    adjustTarget,
    openAdjust,
    closeAdjust,
    submitAdjust,
    adjusting,
    saveMinStock,
    viewHistoryOf,
  } = useInventoryPage()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý tồn kho</h1>
          <p className="text-sm text-slate-500">Theo dõi số lượng, cảnh báo sắp hết và lịch sử xuất nhập của từng sản phẩm</p>
        </div>
        <Button variant="outline" leftIcon={<RefreshCw className={data.loading ? 'size-4 animate-spin' : 'size-4'} />} onClick={data.reload}>
          Tải lại
        </Button>
      </div>

      <InventoryStats
        stats={stock.stats}
        loading={data.loading}
        active={stock.filters.level}
        onSelect={(level) => {
          setTab('stock')
          stock.updateFilter('level', level)
        }}
      />

      <Card className="overflow-hidden">
        <div className="flex gap-1 border-b border-slate-100 px-4">
          {TABS.map(({ value, label, icon: Icon }) => {
            const active = tab === value
            return (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  'relative flex h-12 cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition',
                  active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                <Icon className="size-4" /> {label}
                {value === 'purchasing' && purchasing.counts.open > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 text-[11px] leading-5 text-amber-700">{purchasing.counts.open}</span>
                )}
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-600" />}
              </button>
            )
          })}
        </div>

        {tab === 'stock' ? (
          <>
            <StockFilters
              filters={stock.filters}
              categories={data.categories}
              counts={stock.levelCounts}
              onChange={stock.updateFilter}
              onReset={stock.resetFilters}
              hasActiveFilters={stock.hasActiveFilters}
            />
            <StockTable
              items={stock.paged}
              categories={data.categories}
              total={stock.filtered.length}
              page={stock.page}
              loading={data.loading}
              onPageChange={stock.setPage}
              onView={openDetail}
              onAdjust={openAdjust}
            />
          </>
        ) : tab === 'purchasing' ? (
          <PurchaseOrdersPanel po={purchasing} />
        ) : (
          <MovementHistory history={history} loading={data.loading} />
        )}
      </Card>

      <StockDetailDrawer
        item={detail}
        movements={detailMovements}
        onClose={closeDetail}
        onAdjust={openAdjust}
        onSaveMinStock={saveMinStock}
        onViewHistory={viewHistoryOf}
      />
      <AdjustStockModal item={adjustTarget} saving={adjusting} onClose={closeAdjust} onSubmit={submitAdjust} />
    </div>
  )
}
