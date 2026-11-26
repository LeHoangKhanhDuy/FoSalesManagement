import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { OrderActionModal } from '@/modules/orders/components/OrderActionModal'
import { OrderDetailDrawer } from '@/modules/orders/components/OrderDetailDrawer'
import { OrdersTable } from '@/modules/orders/components/OrdersTable'
import { OrderStats } from '@/modules/orders/components/OrderStats'
import { OrderToolbar } from '@/modules/orders/components/OrderToolbar'
import { PrintReceipt } from '@/modules/orders/components/Receipt'
import { useOrdersPage } from '@/modules/orders/hooks/useOrdersPage'
import { PATHS } from '@/routes/paths'

export default function OrdersPage() {
  const { filters, list, stats, detail, actions, printer, page, setPage, exporting, exportCsv, reload, hasActiveFilters, ...handlers } = useOrdersPage()
  const { print } = printer
  const printOrder = useCallback((order: { id: string }) => print(order.id), [print])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-slate-500">Theo dõi, tra cứu và xử lý toàn bộ đơn hàng của cửa hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={list.loading || list.refreshing ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button variant="outline" leftIcon={<Download className="size-4" />} loading={exporting} onClick={exportCsv}>
            Xuất Excel
          </Button>
          <Link to={PATHS.pos}>
            <Button leftIcon={<Plus className="size-4" />}>Tạo đơn mới</Button>
          </Link>
        </div>
      </div>

      <OrderStats stats={stats.data} loading={stats.loading} error={stats.error} onRetry={stats.reload} />

      <Card className="overflow-hidden">
        <OrderToolbar
          filters={filters}
          counts={list.statusCounts}
          onChange={handlers.updateFilter}
          onDateRangeChange={handlers.updateDateRange}
          onRangePresetChange={handlers.updateRangePreset}
          onReset={handlers.resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <OrdersTable
          orders={list.items}
          total={list.total}
          page={page}
          loading={list.loading}
          refreshing={list.refreshing}
          error={list.error}
          hasActiveFilters={hasActiveFilters}
          printingId={printer.printingId}
          onRetry={list.reload}
          onPageChange={setPage}
          onView={detail.open}
          onAction={actions.request}
          onPrint={printOrder}
          onResetFilters={handlers.resetFilters}
        />
      </Card>

      <OrderDetailDrawer
        summary={detail.summary}
        order={detail.order}
        loading={detail.loading}
        error={detail.error}
        printing={!!detail.summary && printer.printingId === detail.summary.id}
        onRetry={detail.reload}
        onClose={detail.close}
        onAction={actions.request}
        onPrint={printOrder}
      />
      <OrderActionModal target={actions.target} submitting={actions.submitting} onClose={actions.close} onSubmit={actions.submit} />
      <PrintReceipt data={printer.receipt} />
    </div>
  )
}
