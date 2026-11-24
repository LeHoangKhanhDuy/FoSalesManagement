import { Download, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DeleteProductsModal } from '@/modules/products/components/DeleteProductsModal'
import { ProductFilters } from '@/modules/products/components/ProductFilters'
import { ProductFormDrawer } from '@/modules/products/components/ProductFormDrawer'
import { ProductsTable } from '@/modules/products/components/ProductsTable'
import { ProductStats } from '@/modules/products/components/ProductStats'
import { useProductsPage } from '@/modules/products/hooks/useProductsPage'

export default function ProductsPage() {
  const { filters, updateFilter, resetFilters, hasActiveFilters, page, setPage, list, stats, catalog, selection, actions, exporting, exportCsv, reload } =
    useProductsPage()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-slate-500">Quản lý danh sách hàng hóa, giá bán và tồn kho của cửa hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={list.loading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button variant="outline" leftIcon={<Download className="size-4" />} loading={exporting} onClick={exportCsv}>
            Xuất Excel
          </Button>
          <Button leftIcon={<Plus className="size-4" />} onClick={actions.openCreate}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <ProductStats stats={stats.stats} loading={stats.loading} onStockFilter={(v) => updateFilter('stock', v)} />

      <Card className="overflow-hidden">
        <ProductFilters
          filters={filters}
          categories={catalog.categories}
          counts={stats.counts}
          onChange={updateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <ProductsTable
          products={list.items}
          categories={catalog.categories}
          total={list.total}
          page={page}
          loading={list.initialLoading}
          refreshing={list.loading && !list.initialLoading}
          error={list.error}
          hasActiveFilters={hasActiveFilters}
          selectedIds={selection.selectedIds}
          selectedProducts={selection.selectedProducts}
          onPageChange={setPage}
          onToggleSelect={selection.toggle}
          onToggleSelectPage={selection.togglePage}
          onClearSelection={selection.clear}
          onEdit={actions.openEdit}
          onDuplicate={actions.openDuplicate}
          onDelete={actions.requestDelete}
          onStatusChange={actions.changeStatus}
          onResetFilters={resetFilters}
          onRetry={list.reload}
        />
      </Card>

      <ProductFormDrawer
        state={actions.form}
        categories={catalog.categories}
        units={catalog.units}
        unitIdByName={catalog.unitIdByName}
        serverError={actions.serverError}
        saving={actions.saving}
        onClose={actions.closeForm}
        onSubmit={actions.submitForm}
      />
      <DeleteProductsModal products={actions.deleteTarget} deleting={actions.deleting} onClose={actions.closeDelete} onConfirm={actions.confirmDelete} />
    </div>
  )
}
