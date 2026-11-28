import type { ImageFit } from '@/modules/sales/types/sales.types'

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'receiving' | 'partial' | 'completed' | 'cancelled'

export interface PurchaseOrderItem {
  productId: string
  name: string
  sku: string
  barcode: string
  unit: string
  categoryId: string
  image?: string
  imageFit?: ImageFit
  orderedQty: number
  unitCost: number
  packSize: number
  receivedQty: number
  damagedQty: number
}

export type ShortageAction = 'backorder' | 'cancel'
export type ExcessAction = 'accept' | 'return'

export interface ReceivingLine {
  beforeCheck?: { scannedQty: number; damagedQty: number }
  productId: string
  name: string
  sku: string
  barcode: string
  unit: string
  categoryId: string
  image?: string
  imageFit?: ImageFit
  packSize: number
  expectedQty: number
  scannedQty: number
  damagedQty: number
  unitCost: number
  expiryDate?: string
  lotNo?: string
  extra: boolean
  shortageAction: ShortageAction
  excessAction: ExcessAction
}

export interface ReceivingCheckIn {
  supplierDocNo: string
  packageCount: number
  packagingOk: boolean
  deliveredBy: string
}

export interface ReceivingScan {
  id: string
  productId: string
  name: string
  barcode?: string
  quantity: number
  result: 'ok' | 'complete' | 'over' | 'extra'
  at: string
}

export interface ReceivingDraft {
  step: 'check-in' | 'count' | 'review'
  checkIn: ReceivingCheckIn
  lines: ReceivingLine[]
  scans: ReceivingScan[]
  note: string
  approvedBy: string
  startedAt: string
}

export interface GoodsReceipt {
  id: string
  code: string
  receivedAt: string
  receivedBy: string
  supplierDocNo: string
  lines: { productId: string; name: string; sku: string; barcode: string; unit: string; acceptedQty: number; damagedQty: number; unitCost: number; expiryDate?: string; lotNo?: string }[]
  value: number
  note: string
  approvedBy?: string
}

export interface PurchaseOrderEvent {
  label: string
  at: string
  by: string
}

export interface PurchaseOrder {
  id: string
  code: string
  supplierId: string
  supplierName: string
  status: PurchaseOrderStatus
  items: PurchaseOrderItem[]
  discount: number
  note: string
  expectedDate: string
  createdAt: string
  createdBy: string
  history: PurchaseOrderEvent[]
  receipts: GoodsReceipt[]
  draftReceipt?: ReceivingDraft
  cancelReason?: string
}

export interface PurchaseOrderFormValues {
  supplierId: string
  expectedDate?: Date
  items: PurchaseOrderItem[]
  discount: number
  note: string
}

export type LineState = 'pending' | 'partial' | 'complete' | 'over' | 'extra'
