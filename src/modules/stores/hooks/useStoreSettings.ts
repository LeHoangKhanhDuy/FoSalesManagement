import { useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { storesService, type CurrentStore, type StoreSettings } from '@/modules/stores/services/stores.service'

export interface StoreContext {
  store: CurrentStore | null
  error?: string
  reload: () => void
  onSaved: (store: CurrentStore) => void
}

export function useStoreSettings() {
  const { store, error, reload, onSaved } = useOutletContext<StoreContext>()
  const { user } = useAuth()
  const canEdit = user?.role === 'admin'
  const canEditCode = canEdit || user?.role === 'manager'
  const [saving, setSaving] = useState(false)
  const [revision, setRevision] = useState(0)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!store || !canEditCode || saving) return
    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) ?? '').trim()
    const changes: Partial<StoreSettings> = {}
    const code = text('code')
    if (!code) return toast.error('Mã cửa hàng không được để trống')
    if (code !== store.code) changes.code = code
    if (canEdit) {
      const name = text('name')
      if (name.length < 2) return toast.error('Tên cửa hàng cần ít nhất 2 ký tự')
      if (name !== store.name) changes.name = name
      for (const key of ['address', 'branchName', 'phone', 'taxCode', 'receiptFooter'] as const) {
        const value = text(key) || null
        if (value !== store[key]) changes[key] = value
      }
      const returnDays = Number(form.get('returnDays'))
      const allowNegativeStock = form.has('allowNegativeStock')
      if (returnDays !== store.returnDays) changes.returnDays = returnDays
      if (allowNegativeStock !== store.allowNegativeStock) changes.allowNegativeStock = allowNegativeStock
    }
    if (!Object.keys(changes).length) return toast.info('Chưa có thay đổi để lưu')
    setSaving(true)
    try {
      onSaved(await storesService.update(changes))
      setRevision((value) => value + 1)
      toast.success('Đã lưu thông tin cửa hàng')
    } catch (e) {
      toast.error(errorMessage(e, 'Không lưu được thông tin cửa hàng'))
    } finally {
      setSaving(false)
    }
  }

  return { store, error, reload, canEdit, canEditCode, saving, revision, submit }
}
