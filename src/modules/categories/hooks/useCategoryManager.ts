import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { catalogService } from '@/modules/categories/services/catalog.service'
import type { CategoryFormValues, CategoryRecord } from '@/modules/categories/types/categories.types'
import { matchKeyword, sortCategories } from '@/modules/categories/utils/categories.utils'
import type { CategoryStatus } from '@/modules/sales/types/sales.types'

export type CategoryFormState = { mode: 'create' } | { mode: 'edit'; item: CategoryRecord } | null

export function useCategoryManager() {
  const [items, setItems] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<CategoryStatus | 'all'>('all')
  const [form, setForm] = useState<CategoryFormState>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    catalogService
      .getCategories()
      .then(setItems)
      .catch(() => toast.error('Không tải được danh mục'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const sorted = useMemo(() => sortCategories(items), [items])
  const filtered = useMemo(
    () => sorted.filter((c) => (status === 'all' || (c.status ?? 'active') === status) && matchKeyword(keyword, c.name, c.description)),
    [sorted, keyword, status],
  )
  const canReorder = !keyword.trim() && status === 'all'

  const openCreate = useCallback(() => setForm({ mode: 'create' }), [])
  const openEdit = useCallback((item: CategoryRecord) => setForm({ mode: 'edit', item }), [])
  const closeForm = useCallback(() => !saving && setForm(null), [saving])

  const submit = async (values: CategoryFormValues) => {
    if (!form) return
    setSaving(true)
    try {
      if (form.mode === 'edit') {
        const updated = await catalogService.updateCategory(form.item.id, values)
        setItems((list) => list.map((c) => (c.id === updated.id ? updated : c)))
        toast.success(`Đã cập nhật danh mục "${updated.name}"`)
      } else {
        const created = await catalogService.createCategory(values)
        setItems((list) => [...list, created])
        toast.success(`Đã thêm danh mục "${created.name}"`)
      }
      setForm(null)
    } catch {
      toast.error('Lưu danh mục thất bại')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = useCallback(async (item: CategoryRecord) => {
    const next: CategoryStatus = item.status === 'inactive' ? 'active' : 'inactive'
    setItems((list) => list.map((c) => (c.id === item.id ? { ...c, status: next } : c)))
    try {
      await catalogService.updateCategory(item.id, { status: next })
      toast.success(next === 'active' ? `Đã hiển thị "${item.name}" trên POS` : `Đã ẩn "${item.name}" khỏi POS`)
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
      load()
    }
  }, [load])

  const move = useCallback(
    async (id: string, direction: -1 | 1) => {
      const index = sorted.findIndex((c) => c.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= sorted.length) return
      const next = [...sorted]
      ;[next[index], next[target]] = [next[target], next[index]]
      const reordered = next.map((c, i) => ({ ...c, sortOrder: i + 1 }))
      setItems(reordered)
      try {
        await catalogService.reorderCategories(reordered.map((c) => c.id))
      } catch {
        toast.error('Sắp xếp thất bại')
        load()
      }
    },
    [sorted, load],
  )

  const requestDelete = useCallback((item: CategoryRecord) => setDeleteTarget(item), [])
  const closeDelete = useCallback(() => !deleting && setDeleteTarget(null), [deleting])

  const confirmDelete = async (moveToId?: string) => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await catalogService.deleteCategory(deleteTarget.id, moveToId)
      setItems((list) =>
        list
          .filter((c) => c.id !== deleteTarget.id)
          .map((c) => (c.id === moveToId ? { ...c, productCount: c.productCount + deleteTarget.productCount } : c)),
      )
      toast.success(`Đã xóa danh mục "${deleteTarget.name}"`)
      setDeleteTarget(null)
    } catch {
      toast.error('Xóa danh mục thất bại')
    } finally {
      setDeleting(false)
    }
  }

  return {
    items: sorted,
    filtered,
    loading,
    keyword,
    setKeyword,
    status,
    setStatus,
    canReorder,
    form,
    openCreate,
    openEdit,
    closeForm,
    submit,
    saving,
    toggleStatus,
    move,
    deleteTarget,
    requestDelete,
    closeDelete,
    confirmDelete,
    deleting,
    reload: load,
  }
}
