import { Link } from 'react-router-dom'
import { Download, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { OrderActionModal } from '@/modules/orders/components/OrderActionModal'
import { OrderDetailDrawer } from '@/modules/orders/components/OrderDetailDrawer'
import { OrdersTable } from '@/modules/orders/components/OrdersTable'
import { OrderStats } from '@/modules/orders/components/OrderStats'
import { OrderToolbar } from '@/modules/orders/components/OrderToolbar'
import { useOrdersPage } from '@/modules/orders/hooks/useOrdersPage'
import { PATHS } from '@/routes/paths'

export default function OrdersPage() {
  const {
    loading,
    filters,
    updateFilter,
    updateDateRange,
    updateRangePreset,
    resetFilters,
    hasActiveFilters,
    statusCounts,
    stats,
    filtered,
    paged,
    page,
    setPage,
    selectedOrder,
    openDetail,
    closeDetail,
    actionTarget,
    requestAction,
    closeAction,
    submitAction,
    submitting,
    confirmPayment,
    printOrder,
    exportCsv,
    reload,
  } = useOrdersPage()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-slate-500">Theo dõi, tra cứu và xử lý toàn bộ đơn hàng của cửa hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button variant="outline" leftIcon={<Download className="size-4" />} onClick={exportCsv}>
            Xuất Excel
          </Button>
          <Link to={PATHS.pos}>
            <Button leftIcon={<Plus className="size-4" />}>Tạo đơn mới</Button>
          </Link>
        </div>
      </div>

      <OrderStats stats={stats} loading={loading} />

      <Card className="overflow-hidden">
        <OrderToolbar
          filters={filters}
          counts={statusCounts}
          onChange={updateFilter}
          onDateRangeChange={updateDateRange}
          onRangePresetChange={updateRangePreset}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <OrdersTable
          orders={paged}
          total={filtered.length}
          page={page}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          onPageChange={setPage}
          onView={openDetail}
          onAction={requestAction}
          onConfirmPayment={confirmPayment}
          onPrint={printOrder}
          onResetFilters={resetFilters}
        />
      </Card>

      <OrderDetailDrawer
        order={selectedOrder}
        onClose={closeDetail}
        onAction={requestAction}
        onConfirmPayment={confirmPayment}
        onPrint={printOrder}
      />
      <OrderActionModal target={actionTarget} submitting={submitting} onClose={closeAction} onSubmit={submitAction} />
    </div>
  )
}
