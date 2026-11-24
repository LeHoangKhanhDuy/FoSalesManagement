import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, HttpError } from '@/lib/http'
import { useCategoryList } from '@/modules/categories/hooks/useCategoryList'
import { categoryService } from '@/modules/categories/services/category.service'
import type { CategoryFormState, CategoryFormValues, CategoryRecord } from '@/modules/categories/types/categories.types'
import { CATEGORY_ERROR, errorProductCount } from '@/modules/categories/utils/categories.utils'
import type { CategoryStatus } from '@/modules/sales/types/sales.types'

const codeOf = (e: unknown) => (e instanceof HttpError ? e.code : undefined)

export function useCategoryManager() {
  const list = useCategoryList()
  const { items, setItems, upsert, patch, reload } = list
  const [form, setForm] = useState<CategoryFormState>(null)
  const [saving, setSaving] = useState(false)
  const [nameConflict, setNameConflict] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const pendingOrder = useRef<string[] | null>(null)
  const savingOrder = useRef(false)

  const openForm = useCallback((state: CategoryFormState) => {
    setNameConflict(null)
    setForm(state)
  }, [])

  const handleMissing = useCallback(
    (e: unknown) => {
      if (codeOf(e) !== CATEGORY_ERROR.notFound) return false
      toast.error('Danh mục không còn tồn tại, danh sách đã được tải lại')
      setForm(null)
      setDeleteTarget(null)
      reload()
      return true
    },
    [reload],
  )

  const submit = async (values: CategoryFormValues) => {
    if (!form || saving) return
    setSaving(true)
    try {
      const saved = form.mode === 'edit' ? await categoryService.update(form.item.id, values) : await categoryService.create(values)
      upsert(saved)
      toast.success(form.mode === 'edit' ? `Đã cập nhật danh mục "${saved.name}"` : `Đã thêm danh mục "${saved.name}"`)
      setForm(null)
    } catch (e) {
      if (codeOf(e) === CATEGORY_ERROR.nameTaken) setNameConflict(values.name)
      else if (!handleMissing(e)) toast.error(errorMessage(e, 'Lưu danh mục thất bại'))
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = useCallback(
    async (item: CategoryRecord) => {
      const next: CategoryStatus = item.status === 'inactive' ? 'active' : 'inactive'
      patch(item.id, { status: next })
      try {
        upsert(await categoryService.update(item.id, { status: next }))
        toast.success(next === 'active' ? `Đã hiển thị "${item.name}" trên POS` : `Đã ẩn "${item.name}" khỏi POS`)
      } catch (e) {
        patch(item.id, { status: item.status })
        if (!handleMissing(e)) toast.error(errorMessage(e, 'Cập nhật trạng thái thất bại'))
      }
    },
    [patch, upsert, handleMissing],
  )

  const flushOrder = useCallback(async () => {
    if (savingOrder.current) return
    savingOrder.current = true
    while (pendingOrder.current) {
      const ids = pendingOrder.current
      pendingOrder.current = null
      try {
        await categoryService.reorder(ids)
      } catch (e) {
        pendingOrder.current = null
        toast.error(errorMessage(e, 'Sắp xếp thất bại'))
        reload()
      }
    }
    savingOrder.current = false
  }, [reload])

  const move = useCallback(
    (id: string, direction: -1 | 1) => {
      const index = items.findIndex((c) => c.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= items.length) return
      const next = [...items]
      ;[next[index], next[target]] = [next[target], next[index]]
      setItems(next.map((c, i) => ({ ...c, sortOrder: i + 1 })))
      pendingOrder.current = next.map((c) => c.id)
      void flushOrder()
    },
    [items, setItems, flushOrder],
  )

  const confirmDelete = async (moveToId?: string) => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await categoryService.remove(deleteTarget.id, moveToId)
      setItems((list) =>
        list.filter((c) => c.id !== deleteTarget.id).map((c) => (c.id === moveToId ? { ...c, productCount: c.productCount + deleteTarget.productCount } : c)),
      )
      toast.success(`Đã xóa danh mục "${deleteTarget.name}"`)
      setDeleteTarget(null)
    } catch (e) {
      const code = codeOf(e)
      if (code === CATEGORY_ERROR.inUse) {
        const productCount = errorProductCount(e instanceof HttpError ? e.data : null) ?? Math.max(1, deleteTarget.productCount)
        setDeleteTarget({ ...deleteTarget, productCount })
        patch(deleteTarget.id, { productCount })
        toast.warning('Danh mục đang có sản phẩm, hãy chọn danh mục nhận lại sản phẩm')
      } else if (!handleMissing(e)) {
        toast.error(errorMessage(e, 'Xóa danh mục thất bại'))
        if (code === CATEGORY_ERROR.moveTargetInvalid) reload()
      }
    } finally {
      setDeleting(false)
    }
  }

  return {
    ...list,
    form,
    saving,
    nameConflict,
    openCreate: useCallback(() => openForm({ mode: 'create' }), [openForm]),
    openEdit: useCallback((item: CategoryRecord) => openForm({ mode: 'edit', item }), [openForm]),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submit,
    toggleStatus,
    move,
    deleteTarget,
    deleting,
    requestDelete: useCallback((item: CategoryRecord) => setDeleteTarget(item), []),
    closeDelete: useCallback(() => !deleting && setDeleteTarget(null), [deleting]),
    confirmDelete,
  }
}
