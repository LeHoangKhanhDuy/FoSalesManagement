import { Download, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { DeleteSupplierModal } from '@/modules/suppliers/components/DeleteSupplierModal'
import { SupplierDetailDrawer } from '@/modules/suppliers/components/SupplierDetailDrawer'
import { SupplierFilters } from '@/modules/suppliers/components/SupplierFilters'
import { SupplierFormDrawer } from '@/modules/suppliers/components/SupplierFormDrawer'
import { SupplierPaymentModal } from '@/modules/suppliers/components/SupplierPaymentModal'
import { SupplierStats } from '@/modules/suppliers/components/SupplierStats'
import { SupplierTable } from '@/modules/suppliers/components/SupplierTable'
import { SuspendSupplierModal } from '@/modules/suppliers/components/SuspendSupplierModal'
import { useSuppliersPage } from '@/modules/suppliers/hooks/useSuppliersPage'
import { SUPPLIER_PAGE_SIZE } from '@/modules/suppliers/utils/suppliers.utils'

export default function SuppliersPage() {
  const page = useSuppliersPage()
  const { actions } = page

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Nhà cung cấp</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin, đơn đặt hàng và công nợ phải trả nhà cung cấp</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={page.reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={page.reloading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button variant="outline" leftIcon={<Download className="size-4" />} loading={page.exporting} onClick={page.exportCsv}>
            Xuất Excel
          </Button>
          <Button leftIcon={<Plus className="size-4" />} onClick={actions.openCreate}>
            Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      <SupplierStats stats={page.stats} loading={page.statsLoading} onShowDebt={page.showDebt} />

      <Card className="overflow-hidden">
        <SupplierFilters filters={page.filters} categories={page.categories} counts={page.counts} onChange={page.updateFilter} onReset={page.resetFilters} hasActiveFilters={page.hasActiveFilters} />
        <SupplierTable
          suppliers={page.items}
          loading={page.loading}
          refreshing={page.refreshing}
          error={page.error}
          onRetry={page.reload}
          hasActiveFilters={page.hasActiveFilters}
          onView={page.openDetail}
          onEdit={actions.openEdit}
          onPay={actions.openPay}
          onOrder={page.createOrder}
          onChangeStatus={actions.changeStatus}
          onDelete={actions.requestDelete}
          onCreate={actions.openCreate}
          startIndex={(page.page - 1) * SUPPLIER_PAGE_SIZE}
        />
        {!page.loading && page.total > 0 && (
          <Pagination page={page.page} pageSize={SUPPLIER_PAGE_SIZE} total={page.total} onPageChange={page.setPage} unit="nhà cung cấp" className="border-t border-slate-100 px-4 py-3" />
        )}
      </Card>

      <SupplierFormDrawer state={actions.form} serverError={actions.serverError} categories={page.categories} saving={actions.saving} onClose={actions.closeForm} onSubmit={actions.submitForm} />
      <SupplierDetailDrawer supplier={page.detail} categories={page.categories} onClose={page.closeDetail} onEdit={actions.openEdit} onPay={actions.openPay} onOrder={page.createOrder} />
      <SupplierPaymentModal supplier={actions.payTarget} summary={actions.payTarget?.summary} paying={actions.paying} onClose={actions.closePay} onConfirm={actions.submitPayment} />
      <SuspendSupplierModal supplier={actions.suspendTarget} summary={actions.suspendTarget?.summary} saving={actions.suspending} onClose={actions.closeSuspend} onConfirm={actions.confirmSuspend} />
      <DeleteSupplierModal
        supplier={actions.deleteTarget}
        summary={actions.deleteTarget?.summary}
        hasOrders={actions.deleteBlocked}
        deleting={actions.deleting}
        onClose={actions.closeDelete}
        onConfirm={actions.confirmDelete}
        onDeactivate={() => actions.deleteTarget && actions.changeStatus(actions.deleteTarget, 'inactive')}
      />
    </div>
  )
}
