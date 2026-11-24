import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, HttpError } from '@/lib/http'
import { inventoryService } from '@/modules/inventory/services/inventory.service'
import type { AdjustStockPayload, AdjustStockResult, InventoryItem } from '@/modules/inventory/types/inventory.types'
import { errorCurrentStock, INVENTORY_ERROR } from '@/modules/inventory/utils/inventory.utils'

interface AdjustCallbacks {
  onAdjusted: (result: AdjustStockResult) => void
  onStale: () => void
}

export function useStockAdjust(callbacks: AdjustCallbacks) {
  const [target, setTarget] = useState<InventoryItem | null>(null)
  const [saving, setSaving] = useState(false)
  const idempotencyKey = useRef('')
  const handlers = useRef(callbacks)
  handlers.current = callbacks

  const open = useCallback((item: InventoryItem) => {
    idempotencyKey.current = crypto.randomUUID()
    setTarget(item)
  }, [])

  const close = useCallback(() => !saving && setTarget(null), [saving])

  const submit = async (payload: AdjustStockPayload) => {
    if (!target || saving) return
    setSaving(true)
    try {
      const result = await inventoryService.adjust({ ...payload, expectedStock: target.stock }, idempotencyKey.current)
      handlers.current.onAdjusted(result)
      const { movement: m } = result
      toast.success(`${m.productName}: ${m.before} → ${m.after} ${m.unit.toLowerCase()}`)
      setTarget(null)
    } catch (e) {
      if (!(e instanceof HttpError)) return void toast.error(errorMessage(e, 'Điều chỉnh tồn kho thất bại'))
      idempotencyKey.current = crypto.randomUUID()
      const current = errorCurrentStock(e)
      if (e.code === INVENTORY_ERROR.notFound) {
        toast.error('Sản phẩm không còn tồn tại')
        setTarget(null)
        handlers.current.onStale()
      } else if (current !== undefined && (e.code === INVENTORY_ERROR.changed || e.code === INVENTORY_ERROR.insufficient)) {
        setTarget((t) => (t ? { ...t, stock: current } : t))
        toast.warning(`Tồn kho vừa thay đổi, hiện còn ${current}`, { description: 'Kiểm tra lại số lượng rồi xác nhận' })
        handlers.current.onStale()
      } else {
        toast.error(errorMessage(e, 'Điều chỉnh tồn kho thất bại'))
      }
    } finally {
      setSaving(false)
    }
  }

  return { target, saving, open, close, submit }
}
