import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { unitService } from '@/modules/categories/services/unit.service'
import type { UnitFormState, UnitFormValues, UnitRecord } from '@/modules/categories/types/categories.types'
import { errorCode, errorProductCount, matchKeyword, UNIT_ERROR } from '@/modules/categories/utils/categories.utils'

const sortUnits = (list: UnitRecord[]) => [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'))

export function useUnitManager() {
  const [items, setItems] = useState<UnitRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [form, setForm] = useState<UnitFormState>(null)
  const [saving, setSaving] = useState(false)
  const [nameConflict, setNameConflict] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UnitRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    unitService
      .list()
      .then((list) => setItems(sortUnits(list)))
      .catch((e: unknown) => toast.error(errorMessage(e, 'Không tải được đơn vị tính')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const filtered = useMemo(() => items.filter((u) => matchKeyword(keyword, u.name, u.description)), [items, keyword])

  const openForm = useCallback((state: UnitFormState) => {
    setNameConflict(null)
    setForm(state)
  }, [])

  const handleMissing = useCallback(
    (e: unknown) => {
      if (errorCode(e) !== UNIT_ERROR.notFound) return false
      toast.error('Đơn vị tính không còn tồn tại, danh sách đã được tải lại')
      setForm(null)
      setDeleteTarget(null)
      load()
      return true
    },
    [load],
  )

  const submit = async (values: UnitFormValues) => {
    if (!form || saving) return
    setSaving(true)
    try {
      if (form.mode === 'edit') {
        const updated = await unitService.update(form.item.id, values)
        setItems((list) => sortUnits(list.map((u) => (u.id === updated.id ? updated : u))))
        toast.success(
          updated.productCount > 0 && form.item.name !== updated.name
            ? `Đã đổi "${form.item.name}" → "${updated.name}" cho ${updated.productCount} sản phẩm`
            : `Đã cập nhật đơn vị "${updated.name}"`,
        )
      } else {
        const created = await unitService.create(values)
        setItems((list) => sortUnits([...list, created]))
        toast.success(`Đã thêm đơn vị "${created.name}"`)
      }
      setForm(null)
    } catch (e) {
      if (errorCode(e) === UNIT_ERROR.nameTaken) setNameConflict(values.name)
      else if (!handleMissing(e)) toast.error(errorMessage(e, 'Lưu đơn vị tính thất bại'))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (replaceWithId?: string) => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await unitService.remove(deleteTarget.id, replaceWithId)
      setItems((list) =>
        list.filter((u) => u.id !== deleteTarget.id).map((u) => (u.id === replaceWithId ? { ...u, productCount: u.productCount + deleteTarget.productCount } : u)),
      )
      toast.success(`Đã xóa đơn vị "${deleteTarget.name}"`)
      setDeleteTarget(null)
    } catch (e) {
      const code = errorCode(e)
      if (code === UNIT_ERROR.inUse) {
        const productCount = errorProductCount(e) ?? Math.max(1, deleteTarget.productCount)
        setDeleteTarget({ ...deleteTarget, productCount })
        setItems((list) => list.map((u) => (u.id === deleteTarget.id ? { ...u, productCount } : u)))
        toast.warning('Đơn vị tính đang được sử dụng, hãy chọn đơn vị thay thế')
      } else if (!handleMissing(e)) {
        toast.error(errorMessage(e, 'Xóa đơn vị tính thất bại'))
        if (code === UNIT_ERROR.replaceTargetInvalid) load()
      }
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
    saving,
    nameConflict,
    openCreate: useCallback(() => openForm({ mode: 'create' }), [openForm]),
    openEdit: useCallback((item: UnitRecord) => openForm({ mode: 'edit', item }), [openForm]),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submit,
    deleteTarget,
    deleting,
    requestDelete: useCallback((item: UnitRecord) => setDeleteTarget(item), []),
    closeDelete: useCallback(() => !deleting && setDeleteTarget(null), [deleting]),
    confirmDelete,
    reload: load,
  }
}
