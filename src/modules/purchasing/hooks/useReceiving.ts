import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { playTone } from '@/lib/sound'
import { purchasingService } from '@/modules/purchasing/services/purchasing.service'
import type { GoodsReceipt, PurchaseOrder, ReceivingCheckIn, ReceivingDraft, ReceivingLine, ReceivingScan } from '@/modules/purchasing/types/purchasing.types'
import { createReceivingDraft, getLineState, productToExtraLine, summarizeReceiving } from '@/modules/purchasing/utils/receiving.utils'
import type { Product } from '@/modules/sales/types/sales.types'

export interface ScanFlash {
  key: number
  tone: 'success' | 'complete' | 'warning' | 'error'
  title: string
  detail: string
  productId?: string
}

interface Options {
  order: PurchaseOrder
  products: Product[]
  onUpdate: (order: PurchaseOrder, stockChanged?: boolean) => void
  onClose: () => void
}

export function useReceiving({ order, products, onUpdate, onClose }: Options) {
  const [draft, setDraft] = useState<ReceivingDraft>(() => structuredClone(order.draftReceipt) ?? createReceivingDraft(order))
  const [flash, setFlash] = useState<ScanFlash | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null)
  const flashKey = useRef(0)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pendingSave = useRef<Promise<unknown>>(Promise.resolve())
  const finished = useRef(false)
  const summary = useMemo(() => summarizeReceiving(draft.lines), [draft.lines])

  useEffect(() => {
    if (receipt || finished.current || draft.step === 'check-in') return
    autosaveTimer.current = setTimeout(() => {
      pendingSave.current = purchasingService.saveReceivingDraft(order.id, draft).then((o) => {
        if (!finished.current) onUpdate(o)
      })
    }, 600)
    return () => clearTimeout(autosaveTimer.current)
  }, [draft, receipt, order.id, onUpdate])

  const stopAutosave = async () => {
    finished.current = true
    clearTimeout(autosaveTimer.current)
    await pendingSave.current.catch(() => undefined)
  }

  const setCheckIn = (patch: Partial<ReceivingCheckIn>) => setDraft((d) => ({ ...d, checkIn: { ...d.checkIn, ...patch } }))
  const setStep = (step: ReceivingDraft['step']) => setDraft((d) => ({ ...d, step }))
  const setNote = (note: string) => setDraft((d) => ({ ...d, note }))
  const setApprovedBy = (approvedBy: string) => setDraft((d) => ({ ...d, approvedBy }))

  const updateLine = useCallback((productId: string, patch: Partial<ReceivingLine>) => {
    setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.productId === productId ? { ...l, ...patch, damagedQty: Math.min(patch.damagedQty ?? l.damagedQty, patch.scannedQty ?? l.scannedQty) } : l)) }))
  }, [])

  const notify = useCallback((f: Omit<ScanFlash, 'key'>) => {
    flashKey.current += 1
    setFlash({ ...f, key: flashKey.current })
    playTone(f.tone)
  }, [])

  const draftRef = useRef(draft)
  draftRef.current = draft

  const addQuantity = useCallback(
    (productId: string, quantity: number) => {
      const d = draftRef.current
      let lines = d.lines
      let line = lines.find((l) => l.productId === productId)
      if (!line) {
        const product = products.find((p) => p.id === productId)
        if (!product) return
        line = productToExtraLine(product)
        lines = [line, ...lines]
      }
      const next = { ...line, scannedQty: Math.max(0, line.scannedQty + quantity) }
      next.damagedQty = Math.min(next.damagedQty, next.scannedQty)
      const state = getLineState(next)
      const result: ReceivingScan['result'] = state === 'extra' ? 'extra' : state === 'over' ? 'over' : state === 'complete' ? 'complete' : 'ok'
      const scan: ReceivingScan = { id: crypto.randomUUID(), productId, name: next.name, quantity, result, at: new Date().toISOString() }
      const nextDraft: ReceivingDraft = {
        ...d,
        lines: lines.map((l) => (l.productId === productId ? next : l)),
        scans: quantity > 0 ? [scan, ...d.scans].slice(0, 50) : d.scans,
      }
      draftRef.current = nextDraft
      setDraft(nextDraft)
      if (quantity <= 0) return
      notify({
        tone: result === 'ok' ? 'success' : result === 'complete' ? 'complete' : result === 'over' ? 'warning' : 'error',
        title:
          result === 'extra' ? 'Hàng không có trong đơn' : result === 'over' ? 'Vượt số lượng đặt' : result === 'complete' ? 'Đã đủ số lượng' : `+${quantity} ${next.unit.toLowerCase()}`,
        detail: result === 'extra' ? `${next.name} · đã quét ${next.scannedQty}` : `${next.name} · ${next.scannedQty}/${next.expectedQty}`,
        productId,
      })
    },
    [products, notify],
  )

  const scanCode = useCallback(
    (raw: string) => {
      const code = raw.trim().toLowerCase()
      if (!code) return
      const line = draftRef.current.lines.find((l) => l.barcode === code || l.sku.toLowerCase() === code)
      const product = line ? null : products.find((p) => p.barcode === code || p.sku.toLowerCase() === code)
      if (line) addQuantity(line.productId, 1)
      else if (product) addQuantity(product.id, 1)
      else notify({ tone: 'error', title: 'Không nhận diện được mã', detail: `Mã "${raw.trim()}" không có trong hệ thống` })
    },
    [products, addQuantity, notify],
  )

  useBarcodeScanner(scanCode, { enabled: draft.step === 'count' && !receipt })

  const undoLastScan = () => {
    const last = draft.scans[0]
    if (!last) return
    setDraft((d) => ({
      ...d,
      scans: d.scans.slice(1),
      lines: d.lines
        .map((l) => (l.productId === last.productId ? { ...l, scannedQty: Math.max(0, l.scannedQty - last.quantity), damagedQty: Math.min(l.damagedQty, Math.max(0, l.scannedQty - last.quantity)) } : l))
        .filter((l) => !(l.extra && l.scannedQty === 0)),
    }))
    toast.info(`Đã hoàn tác: ${last.name} (−${last.quantity})`)
  }

  const removeExtra = (productId: string) => setDraft((d) => ({ ...d, lines: d.lines.filter((l) => l.productId !== productId) }))

  const pause = async () => {
    await stopAutosave()
    onUpdate(await purchasingService.saveReceivingDraft(order.id, draft))
    toast.success('Đã lưu tiến độ kiểm đếm, có thể tiếp tục sau')
    onClose()
  }

  const discard = async () => {
    await stopAutosave()
    onUpdate(await purchasingService.saveReceivingDraft(order.id, null))
    toast.info('Đã hủy phiên kiểm đếm')
    onClose()
  }

  const complete = async () => {
    setSubmitting(true)
    await stopAutosave()
    try {
      const res = await purchasingService.completeReceiving(order.id, draft)
      setReceipt(res.receipt)
      onUpdate(res.order, true)
      playTone('complete')
    } catch {
      finished.current = false
      toast.error('Nhập kho thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    draft,
    summary,
    flash,
    receipt,
    submitting,
    setCheckIn,
    setStep,
    setNote,
    setApprovedBy,
    updateLine,
    addQuantity,
    scanCode,
    undoLastScan,
    removeExtra,
    pause,
    discard,
    complete,
  }
}
