import type { ExcessAction, LineState, PurchaseOrder, ReceivingDraft, ReceivingLine } from '@/modules/purchasing/types/purchasing.types'
import { APPROVAL_THRESHOLD } from '@/modules/purchasing/utils/purchasing.utils'
import type { Product } from '@/modules/sales/types/sales.types'

export const createReceivingDraft = (order: PurchaseOrder): ReceivingDraft => ({
  step: 'check-in',
  checkIn: { supplierDocNo: '', packageCount: 0, packagingOk: true, deliveredBy: '' },
  lines: order.items
    .filter((i) => i.orderedQty - i.receivedQty > 0)
    .map((i) => ({
      productId: i.productId,
      name: i.name,
      sku: i.sku,
      barcode: i.barcode,
      unit: i.unit,
      categoryId: i.categoryId,
      image: i.image,
      imageFit: i.imageFit,
      packSize: i.packSize,
      expectedQty: i.orderedQty - i.receivedQty,
      scannedQty: 0,
      damagedQty: 0,
      unitCost: i.unitCost,
      extra: false,
      shortageAction: 'backorder',
      excessAction: 'accept',
    })),
  scans: [],
  note: '',
  approvedBy: '',
  startedAt: new Date().toISOString(),
})

export const productToExtraLine = (p: Product): ReceivingLine => ({
  productId: p.id,
  name: p.name,
  sku: p.sku,
  barcode: p.barcode,
  unit: p.unit,
  categoryId: p.categoryId,
  image: p.image,
  imageFit: p.imageFit,
  packSize: 1,
  expectedQty: 0,
  scannedQty: 0,
  damagedQty: 0,
  unitCost: p.costPrice ?? Math.round(p.price * 0.75),
  extra: true,
  shortageAction: 'cancel',
  excessAction: 'return',
})

export const getLineState = (l: ReceivingLine): LineState => {
  if (l.extra) return 'extra'
  if (l.scannedQty === 0) return 'pending'
  if (l.scannedQty < l.expectedQty) return 'partial'
  if (l.scannedQty === l.expectedQty) return 'complete'
  return 'over'
}

export const LINE_STATE: Record<LineState, { label: string; dot: string; row: string; text: string }> = {
  pending: { label: 'Chưa quét', dot: 'bg-slate-300', row: '', text: 'text-slate-400' },
  partial: { label: 'Còn thiếu', dot: 'bg-amber-400', row: 'bg-amber-50/40', text: 'text-amber-600' },
  complete: { label: 'Đủ', dot: 'bg-primary-500', row: 'bg-primary-50/40', text: 'text-primary-600' },
  over: { label: 'Thừa', dot: 'bg-rose-500', row: 'bg-rose-50/40', text: 'text-rose-600' },
  extra: { label: 'Ngoài đơn', dot: 'bg-rose-500', row: 'bg-rose-50/40', text: 'text-rose-600' },
}

export const acceptedQty = (l: ReceivingLine, excess: ExcessAction = l.excessAction) => {
  const base = l.extra ? (excess === 'accept' ? l.scannedQty : 0) : excess === 'accept' ? l.scannedQty : Math.min(l.scannedQty, l.expectedQty)
  return Math.max(0, base - Math.min(l.damagedQty, base))
}

export const summarizeReceiving = (lines: ReceivingLine[]) => {
  const s = { expected: 0, scanned: 0, shortage: 0, over: 0, damaged: 0, extra: 0, accepted: 0, expectedValue: 0, acceptedValue: 0, complete: 0, total: 0 }
  for (const l of lines) {
    const state = getLineState(l)
    if (!l.extra) {
      s.total += 1
      s.expected += l.expectedQty
      s.expectedValue += l.expectedQty * l.unitCost
      if (state === 'complete' || state === 'over') s.complete += 1
      s.shortage += Math.max(0, l.expectedQty - l.scannedQty)
      s.over += Math.max(0, l.scannedQty - l.expectedQty)
    } else s.extra += l.scannedQty
    s.scanned += l.scannedQty
    s.damaged += l.damagedQty
    const acc = acceptedQty(l)
    s.accepted += acc
    s.acceptedValue += acc * l.unitCost
  }
  const diffValue = s.acceptedValue - s.expectedValue
  return { ...s, diffValue, needsApproval: s.expectedValue > 0 && Math.abs(diffValue) / s.expectedValue > APPROVAL_THRESHOLD }
}

export const hasDiscrepancy = (l: ReceivingLine) => l.extra || l.damagedQty > 0 || l.scannedQty !== l.expectedQty
