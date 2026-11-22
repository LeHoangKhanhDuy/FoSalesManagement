import { useState } from 'react'
import { toast } from 'sonner'
import { salesService } from '@/modules/sales/services/sales.service'
import type { Customer } from '@/modules/sales/types/sales.types'

export function useQuickCustomer(onCreated: (c: Customer) => void) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const start = (keyword: string) => {
    const digits = keyword.replace(/\D/g, '')
    setPhone(digits.length >= 3 ? digits : '')
    setName(digits.length >= 3 ? '' : keyword.trim())
    setError(null)
    setOpen(true)
  }

  const submit = async () => {
    const p = phone.replace(/\D/g, '')
    if (!name.trim()) return setError('Nhập tên khách hàng')
    if (!/^0\d{9}$/.test(p)) return setError('Số điện thoại gồm 10 số, bắt đầu bằng 0')
    setSaving(true)
    try {
      const c = await salesService.quickCreateCustomer(name, p)
      toast.success(`Đã thêm khách hàng ${c.name}`)
      onCreated(c)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thêm được khách hàng')
    } finally {
      setSaving(false)
    }
  }

  return { open, name, phone, error, saving, setName, setPhone, start, submit, close: () => !saving && setOpen(false) }
}
