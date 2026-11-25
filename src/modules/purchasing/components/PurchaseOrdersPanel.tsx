import { Plus, Search, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/lib/cn'
import { CancelPurchaseOrderModal } from '@/modules/purchasing/components/CancelPurchaseOrderModal'
import { PurchaseOrderDetailDrawer } from '@/modules/purchasing/components/PurchaseOrderDetailDrawer'
import { PurchaseOrderFormDrawer } from '@/modules/purchasing/components/PurchaseOrderFormDrawer'
import { PurchaseOrderTable } from '@/modules/purchasing/components/PurchaseOrderTable'
import { ReceivingScreen } from '@/modules/purchasing/components/ReceivingScreen'
import type { usePurchaseOrders } from '@/modules/purchasing/hooks/usePurchaseOrders'
import { PO_PAGE_SIZE, PO_STATUS_TABS } from '@/modules/purchasing/utils/purchasing.utils'

export function PurchaseOrdersPanel({ po }: { po: ReturnType<typeof usePurchaseOrders> }) {
  return (
    <>
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-slate-100 px-4">
        {PO_STATUS_TABS.map((t) => {
          const active = po.tab === t.value
          return (
            <button
              key={t.value}
              onClick={() => po.setTab(t.value)}
              className={cn('relative flex h-12 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition', active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800')}
            >
              {t.label}
              <span className={cn('rounded-full px-2 text-[11px] leading-5', active ? 'bg-primary-600 text-white' : t.value === 'open' && po.counts.open ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>
                {po.counts[t.value] ?? 0}
              </span>
              {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-600" />}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Input
          value={po.keyword}
          onChange={(e) => po.setKeyword(e.target.value)}
          placeholder="Tìm mã đơn, nhà cung cấp, sản phẩm..."
          leftIcon={<Search />}
          wrapperClassName="min-w-[260px] flex-1"
          rightSlot={
            po.keyword && (
              <button onClick={() => po.setKeyword('')} className="cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa tìm kiếm">
                <X className="size-4" />
              </button>
            )
          }
        />
        <Button variant="outline" className="h-11 rounded-lg" leftIcon={<TriangleAlert className="size-4 text-amber-500" />} onClick={() => po.openCreate('low-stock')}>
          Đặt hàng sắp hết
        </Button>
        <Button className="h-11 rounded-lg" leftIcon={<Plus className="size-4" />} onClick={() => po.openCreate()}>
          Đặt hàng
        </Button>
      </div>

      <PurchaseOrderTable orders={po.paged} loading={po.loading} onView={po.openDetail} onEdit={po.openEdit} onPlace={po.placeOrder} onReceive={po.startReceiving} onCancel={po.requestCancel} />
      {!po.loading && po.filtered.length > 0 && (
        <Pagination page={po.page} pageSize={PO_PAGE_SIZE} total={po.filtered.length} onPageChange={po.setPage} unit="đơn" className="border-t border-slate-100 px-4 py-3" />
      )}

      <PurchaseOrderFormDrawer state={po.form} products={po.products} suppliers={po.suppliers} saving={po.saving} onClose={po.closeForm} onSubmit={po.submitForm} />
      <PurchaseOrderDetailDrawer order={po.detail} onClose={po.closeDetail} onEdit={po.openEdit} onPlace={po.placeOrder} onReceive={po.startReceiving} onCancel={po.requestCancel} />
      <CancelPurchaseOrderModal key={po.cancelTarget?.id} order={po.cancelTarget} onClose={po.closeCancel} onConfirm={po.confirmCancel} />
      <ReceivingScreen order={po.receivingOrder} products={po.products} onUpdate={po.onReceivingUpdate} onClose={po.closeReceiving} />
    </>
  )
}
