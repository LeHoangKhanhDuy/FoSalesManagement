import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { catalogService } from '@/modules/categories/services/catalog.service'
import type { UnitFormValues, UnitRecord } from '@/modules/categories/types/categories.types'
import { matchKeyword } from '@/modules/categories/utils/categories.utils'

export type UnitFormState = { mode: 'create' } | { mode: 'edit'; item: UnitRecord } | null

export function useUnitManager() {
  const [items, setItems] = useState<UnitRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [form, setForm] = useState<UnitFormState>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UnitRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    catalogService
      .getUnits()
      .then(setItems)
      .catch(() => toast.error('Không tải được đơn vị tính'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const filtered = useMemo(() => items.filter((u) => matchKeyword(keyword, u.name, u.description)), [items, keyword])

  const openCreate = useCallback(() => setForm({ mode: 'create' }), [])
  const openEdit = useCallback((item: UnitRecord) => setForm({ mode: 'edit', item }), [])
  const closeForm = useCallback(() => !saving && setForm(null), [saving])

  const submit = async (values: UnitFormValues) => {
    if (!form) return
    setSaving(true)
    try {
      if (form.mode === 'edit') {
        const updated = await catalogService.updateUnit(form.item.id, values)
        setItems((list) => list.map((u) => (u.id === updated.id ? updated : u)))
        toast.success(
          updated.productCount > 0 && form.item.name !== updated.name
            ? `Đã đổi "${form.item.name}" → "${updated.name}" cho ${updated.productCount} sản phẩm`
            : `Đã cập nhật đơn vị "${updated.name}"`,
        )
      } else {
        const created = await catalogService.createUnit(values)
        setItems((list) => [...list, created])
        toast.success(`Đã thêm đơn vị "${created.name}"`)
      }
      setForm(null)
    } catch {
      toast.error('Lưu đơn vị tính thất bại')
    } finally {
      setSaving(false)
    }
  }

  const requestDelete = useCallback((item: UnitRecord) => setDeleteTarget(item), [])
  const closeDelete = useCallback(() => !deleting && setDeleteTarget(null), [deleting])

  const confirmDelete = async (replaceWithId?: string) => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await catalogService.deleteUnit(deleteTarget.id, replaceWithId)
      setItems((list) =>
        list
          .filter((u) => u.id !== deleteTarget.id)
          .map((u) => (u.id === replaceWithId ? { ...u, productCount: u.productCount + deleteTarget.productCount } : u)),
      )
      toast.success(`Đã xóa đơn vị "${deleteTarget.name}"`)
      setDeleteTarget(null)
    } catch {
      toast.error('Xóa đơn vị tính thất bại')
    } finally {
      setDeleting(false)
    }
  }

  return {
    items,
    filtered,
    loading,
    keyword,
    setKeyword,
    form,
    openCreate,
    openEdit,
    closeForm,
    submit,
    saving,
    deleteTarget,
    requestDelete,
    closeDelete,
    confirmDelete,
    deleting,
    reload: load,
  }
}
