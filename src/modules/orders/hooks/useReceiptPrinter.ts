import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { ordersService } from '@/modules/orders/services/orders.service'
import type { ReceiptData } from '@/modules/orders/types/orders.types'

export function useReceiptPrinter() {
  const [job, setJob] = useState<{ orderId: string; data: ReceiptData } | null>(null)
  const [printingId, setPrintingId] = useState<string | null>(null)

  const print = useCallback(async (orderId: string) => {
    setPrintingId(orderId)
    try {
      setJob({ orderId, data: await ordersService.receipt(orderId) })
    } catch (e) {
      toast.error(errorMessage(e, 'Không tải được dữ liệu hóa đơn'))
      setPrintingId(null)
    }
  }, [])

  useEffect(() => {
    if (!job) return
    const frame = requestAnimationFrame(() => {
      window.print()
      ordersService.markPrinted(job.orderId).catch(() => undefined)
      setJob(null)
      setPrintingId(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [job])

  return { print, printingId, receipt: job?.data ?? null }
}
