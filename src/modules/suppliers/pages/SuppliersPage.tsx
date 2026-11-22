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
  const { data } = page

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Nhà cung cấp</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin, đơn đặt hàng và công nợ phải trả nhà cung cấp</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={data.reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={data.loading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button variant="outline" leftIcon={<Download className="size-4" />} onClick={page.exportCsv}>
            Xuất Excel
          </Button>
          <Button leftIcon={<Plus className="size-4" />} onClick={page.openCreate}>
            Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      <SupplierStats stats={data.stats} loading={data.loading} onShowDebt={page.showDebt} />

      <Card className="overflow-hidden">
        <SupplierFilters filters={page.filters} categories={data.categories} counts={page.counts} onChange={page.updateFilter} onReset={page.resetFilters} hasActiveFilters={page.hasActiveFilters} />
        <SupplierTable
          suppliers={page.paged}
          summaries={data.summaries}
          loading={data.loading}
          hasActiveFilters={page.hasActiveFilters}
          onView={page.openDetail}
          onEdit={page.openEdit}
          onPay={page.openPay}
          onOrder={page.createOrder}
          onChangeStatus={page.changeStatus}
          onDelete={page.requestDelete}
          onCreate={page.openCreate}
        />
        {!data.loading && page.filtered.length > 0 && (
          <Pagination page={page.page} pageSize={SUPPLIER_PAGE_SIZE} total={page.filtered.length} onPageChange={page.setPage} unit="nhà cung cấp" className="border-t border-slate-100 px-4 py-3" />
        )}
      </Card>

      <SupplierFormDrawer state={page.form} suppliers={data.suppliers} categories={data.categories} saving={page.saving} onClose={page.closeForm} onSubmit={page.submitForm} />
      <SupplierDetailDrawer
        supplier={page.detail}
        summaries={data.summaries}
        orders={data.orders}
        payments={data.payments}
        categories={data.categories}
        onClose={page.closeDetail}
        onEdit={page.openEdit}
        onPay={page.openPay}
        onOrder={page.createOrder}
      />
      <SupplierPaymentModal supplier={page.payTarget} summary={page.payTarget ? data.summaries[page.payTarget.id] : undefined} paying={page.paying} onClose={page.closePay} onConfirm={page.submitPayment} />
      <SuspendSupplierModal
        supplier={page.suspendTarget}
        summary={page.suspendTarget ? data.summaries[page.suspendTarget.id] : undefined}
        saving={page.suspending}
        onClose={page.closeSuspend}
        onConfirm={page.confirmSuspend}
      />
      <DeleteSupplierModal
        supplier={page.deleteTarget}
        summary={page.deleteTarget ? data.summaries[page.deleteTarget.id] : undefined}
        hasOrders={page.deleteHasOrders}
        deleting={page.deleting}
        onClose={page.closeDelete}
        onConfirm={page.confirmDelete}
        onDeactivate={(s) => page.changeStatus(s, 'inactive')}
      />
    </div>
  )
}
