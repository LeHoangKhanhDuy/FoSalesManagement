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
  const {
    products,
    categories,
    units,
    loading,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    statusCounts,
    stats,
    filtered,
    paged,
    page,
    setPage,
    selectedIds,
    selectedProducts,
    toggleSelect,
    toggleSelectPage,
    clearSelection,
    form,
    openCreate,
    openEdit,
    openDuplicate,
    closeForm,
    submitForm,
    saving,
    changeStatus,
    deleteTarget,
    requestDelete,
    closeDelete,
    confirmDelete,
    deleting,
    exportCsv,
    reload,
  } = useProductsPage()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-slate-500">Quản lý danh sách hàng hóa, giá bán và tồn kho của cửa hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button variant="outline" leftIcon={<Download className="size-4" />} onClick={exportCsv}>
            Xuất Excel
          </Button>
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <ProductStats stats={stats} loading={loading} onStockFilter={(v) => updateFilter('stock', v)} />

      <Card className="overflow-hidden">
        <ProductFilters
          filters={filters}
          categories={categories}
          counts={statusCounts}
          onChange={updateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <ProductsTable
          products={paged}
          categories={categories}
          total={filtered.length}
          page={page}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          selectedIds={selectedIds}
          selectedProducts={selectedProducts}
          onPageChange={setPage}
          onToggleSelect={toggleSelect}
          onToggleSelectPage={toggleSelectPage}
          onClearSelection={clearSelection}
          onEdit={openEdit}
          onDuplicate={openDuplicate}
          onDelete={requestDelete}
          onStatusChange={changeStatus}
          onResetFilters={resetFilters}
        />
      </Card>

      <ProductFormDrawer
        state={form}
        products={products}
        categories={categories}
        units={units}
        saving={saving}
        onClose={closeForm}
        onSubmit={submitForm}
      />
      <DeleteProductsModal products={deleteTarget} deleting={deleting} onClose={closeDelete} onConfirm={confirmDelete} />
    </div>
  )
}
