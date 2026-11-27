import { Download, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/lib/cn'
import { AdjustPointsModal } from '@/modules/customers/components/AdjustPointsModal'
import { CustomerDetailDrawer } from '@/modules/customers/components/CustomerDetailDrawer'
import { CustomerFilters } from '@/modules/customers/components/CustomerFilters'
import { CustomerFormDrawer } from '@/modules/customers/components/CustomerFormDrawer'
import { CustomerStats } from '@/modules/customers/components/CustomerStats'
import { CustomerTable } from '@/modules/customers/components/CustomerTable'
import { DeleteCustomerModal } from '@/modules/customers/components/DeleteCustomerModal'
import { MembershipSettingsPanel } from '@/modules/customers/components/MembershipSettingsPanel'
import { useCustomersPage } from '@/modules/customers/hooks/useCustomersPage'
import { CUSTOMER_PAGE_SIZE } from '@/modules/customers/utils/customers.utils'

export default function CustomersPage() {
  const page = useCustomersPage()
  const views = [
    { value: 'customers' as const, label: 'Danh sách khách hàng' },
    { value: 'membership' as const, label: 'Hạng thành viên & tích điểm' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý khách hàng</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin khách hàng, hạng thành viên và điểm tích lũy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={page.reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={page.loading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button variant="outline" leftIcon={<Download className="size-4" />} onClick={page.exportCsv}>
            Xuất Excel
          </Button>
          <Button leftIcon={<Plus className="size-4" />} onClick={page.openCreate}>
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {page.error && <p role="alert">{page.error}</p>}
      <CustomerStats stats={page.stats} pointValue={page.settings?.pointValue ?? 0} loading={page.loading} onBirthday={() => page.updateFilter('segment', 'birthday')} />

      <Card className="overflow-hidden">
        <div className="flex gap-1 px-4">
          {views.map(({ value, label }) => {
            const active = page.view === value
            return (
              <button
                key={value}
                onClick={() => page.setView(value)}
                className={cn(
                  'relative flex h-12 cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition',
                  active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                {label}
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-600" />}
              </button>
            )
          })}
        </div>
        {page.view === 'customers' ? (
          <>
            <CustomerFilters
              filters={page.filters}
              settings={page.settings}
              counts={page.counts}
              onChange={page.updateFilter}
              onReset={page.resetFilters}
              hasActiveFilters={page.hasActiveFilters}
            />
            <CustomerTable
              customers={page.paged}
              settings={page.settings}
              loading={page.loading}
              hasActiveFilters={page.hasActiveFilters}
              onView={page.openDetail}
              onEdit={page.openEdit}
              onPoints={page.openPoints}
              onToggleBlock={page.toggleBlock}
              onDelete={page.requestDelete}
            />
            {!page.loading && page.total > 0 && (
              <Pagination
                page={page.page}
                pageSize={CUSTOMER_PAGE_SIZE}
                total={page.total}
                onPageChange={page.setPage}
                unit="khách hàng"
                className="border-t border-slate-100 px-4 py-3"
              />
            )}
          </>
        ) : page.settings ? (
          <MembershipSettingsPanel key={JSON.stringify(page.settings)} settings={page.settings} counts={page.counts} onSave={page.saveSettings} />
        ) : null}
      </Card>

      <CustomerFormDrawer state={page.form} customers={page.customers} saving={page.saving} onClose={page.closeForm} onSubmit={page.submitForm} />
      <CustomerDetailDrawer key={page.detail?.id} customer={page.detail} settings={page.settings} onClose={page.closeDetail} onEdit={page.openEdit} onPoints={page.openPoints} />
      <AdjustPointsModal
        customer={page.pointsTarget}
        pointValue={page.settings?.pointValue ?? 0}
        saving={page.adjusting}
        onClose={page.closePoints}
        onConfirm={page.submitPoints}
      />
      <DeleteCustomerModal customer={page.deleteTarget} deleting={page.deleting} onClose={page.closeDelete} onConfirm={page.confirmDelete} onBlock={page.toggleBlock} />
    </div>
  )
}
