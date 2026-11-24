import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import type { ProductServerError } from '@/modules/products/hooks/useProductForm'
import { productsService } from '@/modules/products/services/products.service'
import type { ProductFormMode, ProductFormValues } from '@/modules/products/types/products.types'
import { productFieldError, toCreatePayload, toUpdatePayload } from '@/modules/products/utils/products.utils'
import type { Product, ProductStatus } from '@/modules/sales/types/sales.types'

interface ActionDeps {
  patchItems: (update: (list: Product[]) => Product[]) => void
  onCreated: () => void
  onChanged: (options?: { listStale?: boolean }) => void
  onDeleted: (ids: string[]) => void
  syncSelection: (products: Product[]) => void
}

const replaceIn = (updated: Product[]) => (list: Product[]) => list.map((p) => updated.find((u) => u.id === p.id) ?? p)

export function useProductActions({ patchItems, onCreated, onChanged, onDeleted, syncSelection }: ActionDeps) {
  const [form, setForm] = useState<ProductFormMode | null>(null)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<ProductServerError | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product[] | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openForm = useCallback((state: ProductFormMode) => {
    setServerError(null)
    setForm(state)
  }, [])

  const submitForm = async (values: ProductFormValues, initial: ProductFormValues) => {
    if (!form || saving) return
    const editing = form.mode === 'edit' ? form.product : null
    const payload = editing ? toUpdatePayload(values, initial) : toCreatePayload(values)
    if (editing && Object.keys(payload).length === 0) {
      setForm(null)
      return toast.info('Không có thay đổi nào')
    }
    setSaving(true)
    try {
      if (editing) {
        const updated = await productsService.update(editing.id, payload)
        patchItems(replaceIn([updated]))
        syncSelection([updated])
        onChanged({ listStale: payload.status !== undefined || payload.stock !== undefined || payload.categoryId !== undefined })
        toast.success(`Đã cập nhật "${updated.name}"`)
      } else {
        const created = await productsService.create(payload)
        onCreated()
        toast.success(`Đã thêm "${created.name}"`, { description: `SKU ${created.sku}` })
      }
      setForm(null)
    } catch (e) {
      const fieldErrors = productFieldError(e)
      if (fieldErrors) setServerError({ errors: fieldErrors, values })
      else toast.error(errorMessage(e, 'Lưu sản phẩm thất bại, vui lòng thử lại'))
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = useCallback(
    async (ids: string[], status: ProductStatus) => {
      patchItems((list) => list.map((p) => (ids.includes(p.id) ? { ...p, status } : p)))
      try {
        const { updated } = await productsService.setStatus(ids, status)
        const verb = status === 'active' ? 'mở bán' : 'ngừng bán'
        toast.success(ids.length > 1 ? `Đã ${verb} ${updated} sản phẩm` : `Đã ${verb} sản phẩm`)
        onChanged({ listStale: true })
      } catch (e) {
        toast.error(errorMessage(e, 'Cập nhật trạng thái thất bại'))
        onChanged({ listStale: true })
      }
    },
    [patchItems, onChanged],
  )

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    const ids = deleteTarget.map((p) => p.id)
    try {
      const { deleted, withStock } = await productsService.bulkDelete(ids)
      onDeleted(ids)
      toast.success(deleted > 1 ? `Đã xóa ${deleted} sản phẩm` : `Đã xóa "${deleteTarget[0].name}"`, {
        description: withStock > 0 ? `${withStock} sản phẩm vẫn còn tồn kho khi xóa` : undefined,
      })
      setDeleteTarget(null)
    } catch (e) {
      toast.error(errorMessage(e, 'Xóa sản phẩm thất bại'))
    } finally {
      setDeleting(false)
    }
  }

  return {
    form,
    saving,
    serverError,
    openCreate: useCallback(() => openForm({ mode: 'create' }), [openForm]),
    openEdit: useCallback((product: Product) => openForm({ mode: 'edit', product }), [openForm]),
    openDuplicate: useCallback((product: Product) => openForm({ mode: 'duplicate', product }), [openForm]),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    changeStatus,
    deleteTarget,
    deleting,
    requestDelete: useCallback((items: Product[]) => setDeleteTarget(items), []),
    closeDelete: useCallback(() => !deleting && setDeleteTarget(null), [deleting]),
    confirmDelete,
  }
}
