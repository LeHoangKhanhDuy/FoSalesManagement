import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { useDebounce } from '@/hooks/useDebounce'
import type { ProductFormMode } from '@/modules/products/hooks/useProductForm'
import { productsService } from '@/modules/products/services/products.service'
import type { ProductFilters, ProductFormValues } from '@/modules/products/types/products.types'
import {
  calcProductStats,
  DEFAULT_FILTERS,
  exportProductsCsv,
  filterProducts,
  formToProduct,
  PAGE_SIZE,
  sortProducts,
} from '@/modules/products/utils/products.utils'
import { catalogService } from '@/modules/categories/services/catalog.service'
import type { Category, Product, ProductStatus } from '@/modules/sales/types/sales.types'


export function useProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<ProductFormMode | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product[] | null>(null)
  const [deleting, setDeleting] = useState(false)
  const keyword = useDebounce(filters.keyword, 250)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([productsService.getProducts(), catalogService.getCategories(), catalogService.getUnits().catch(() => [])])
      .then(([p, c, u]) => {
        setProducts(p)
        setCategories([{ id: 'all', name: 'Tất cả' }, ...c])
        setUnits(u.map((x) => x.name))
      })
      .catch(() => toast.error('Không tải được danh sách sản phẩm'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const updateFilter = useCallback(<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
    setSelectedIds(new Set())
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
    setSelectedIds(new Set())
  }, [])

  const baseFiltered = useMemo(() => filterProducts(products, filters, keyword), [products, filters, keyword])

  const statusCounts = useMemo(
    () => ({
      all: baseFiltered.length,
      active: baseFiltered.filter((p) => p.status !== 'inactive').length,
      inactive: baseFiltered.filter((p) => p.status === 'inactive').length,
    }),
    [baseFiltered],
  )

  const stats = useMemo(() => calcProductStats(products), [products])

  const filtered = useMemo(() => {
    const list =
      filters.status === 'all'
        ? baseFiltered
        : baseFiltered.filter((p) => (filters.status === 'inactive' ? p.status === 'inactive' : p.status !== 'inactive'))
    return sortProducts(list, filters.sort)
  }, [baseFiltered, filters.status, filters.sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage])

  const hasActiveFilters =
    filters.keyword !== '' || filters.status !== 'all' || filters.categoryId !== 'all' || filters.stock !== 'all'

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectPage = useCallback(
    (checked: boolean) =>
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paged.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)))
        return next
      }),
    [paged],
  )

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const openCreate = useCallback(() => setForm({ mode: 'create' }), [])
  const openEdit = useCallback((product: Product) => setForm({ mode: 'edit', product }), [])
  const openDuplicate = useCallback((product: Product) => setForm({ mode: 'duplicate', product }), [])
  const closeForm = useCallback(() => !saving && setForm(null), [saving])

  const submitForm = async (values: ProductFormValues) => {
    if (!form) return
    setSaving(true)
    try {
      const data = formToProduct(values)
      if (form.mode === 'edit') {
        const updated = await productsService.updateProduct(form.product.id, data)
        setProducts((list) => list.map((p) => (p.id === updated.id ? updated : p)))
        toast.success(`Đã cập nhật "${updated.name}"`)
      } else {
        const created = await productsService.createProduct(data)
        setProducts((list) => [created, ...list])
        toast.success(`Đã thêm "${created.name}"`)
      }
      setForm(null)
    } catch {
      toast.error('Lưu sản phẩm thất bại, vui lòng thử lại')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = useCallback(async (ids: string[], status: ProductStatus) => {
    setProducts((list) => list.map((p) => (ids.includes(p.id) ? { ...p, status } : p)))
    try {
      await productsService.setStatus(ids, status)
      toast.success(
        ids.length > 1
          ? `Đã ${status === 'active' ? 'mở bán' : 'ngừng bán'} ${ids.length} sản phẩm`
          : status === 'active'
            ? 'Đã mở bán sản phẩm'
            : 'Đã ngừng bán sản phẩm',
      )
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
      load()
    }
  }, [load])

  const requestDelete = useCallback((items: Product[]) => setDeleteTarget(items), [])
  const closeDelete = useCallback(() => !deleting && setDeleteTarget(null), [deleting])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const ids = deleteTarget.map((p) => p.id)
    try {
      await productsService.deleteProducts(ids)
      setProducts((list) => list.filter((p) => !ids.includes(p.id)))
      setSelectedIds((prev) => new Set([...prev].filter((id) => !ids.includes(id))))
      toast.success(ids.length > 1 ? `Đã xóa ${ids.length} sản phẩm` : `Đã xóa "${deleteTarget[0].name}"`)
      setDeleteTarget(null)
    } catch {
      toast.error('Xóa sản phẩm thất bại')
    } finally {
      setDeleting(false)
    }
  }

  useBarcodeScanner(
    (code) => {
      setFilters((f) => ({ ...f, keyword: code, status: 'all', categoryId: 'all', stock: 'all' }))
      setPage(1)
      setSelectedIds(new Set())
      const found = products.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase())
      if (found) toast.success(`Đã tìm thấy: ${found.name}`, { duration: 1500 })
      else toast.error(`Không có sản phẩm mã "${code}"`, { description: 'Bạn có thể thêm sản phẩm mới với mã vạch này' })
    },
    { enabled: !form && !deleteTarget },
  )

  const selectedProducts = useMemo(() => products.filter((p) => selectedIds.has(p.id)), [products, selectedIds])

  const exportCsv = () => {
    if (filtered.length === 0) return toast.info('Không có sản phẩm để xuất')
    exportProductsCsv(filtered, categories)
    toast.success(`Đã xuất ${filtered.length} sản phẩm`)
  }

  return {
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
    page: currentPage,
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
    reload: load,
  }
}
