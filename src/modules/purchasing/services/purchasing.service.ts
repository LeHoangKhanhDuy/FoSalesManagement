import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { recordStockMovement } from '@/modules/inventory/mocks/movements.mock'
import { MOCK_PURCHASE_ORDERS } from '@/modules/purchasing/mocks/purchase-orders.mock'
import { MOCK_SUPPLIERS } from '@/modules/purchasing/mocks/suppliers.mock'
import type { GoodsReceipt, PurchaseOrder, PurchaseOrderFormValues, ReceivingDraft, Supplier } from '@/modules/purchasing/types/purchasing.types'
import { generateCode } from '@/modules/purchasing/utils/purchasing.utils'
import { acceptedQty } from '@/modules/purchasing/utils/receiving.utils'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'

const USER = 'Khánh Duy'
const now = () => new Date().toISOString()

const find = (id: string) => {
  const order = MOCK_PURCHASE_ORDERS.find((o) => o.id === id)
  if (!order) throw new Error('Không tìm thấy đơn đặt hàng')
  return order
}

const applyForm = (order: PurchaseOrder, v: PurchaseOrderFormValues) => {
  const supplier = MOCK_SUPPLIERS.find((s) => s.id === v.supplierId)
  Object.assign(order, {
    supplierId: v.supplierId,
    supplierName: supplier?.name ?? '',
    items: structuredClone(v.items),
    discount: v.discount,
    note: v.note.trim(),
    expectedDate: (v.expectedDate ?? new Date()).toISOString(),
  })
}

export const purchasingService = {
  async getSuppliers(): Promise<Supplier[]> {
    if (!USE_MOCK) return http.get<Supplier[]>('/api/suppliers')
    return sleep(150).then(() => structuredClone(MOCK_SUPPLIERS))
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    if (!USE_MOCK) return http.get<PurchaseOrder[]>('/api/purchase-orders')
    return sleep(350).then(() => structuredClone(MOCK_PURCHASE_ORDERS))
  },

  async savePurchaseOrder(id: string | null, values: PurchaseOrderFormValues, place: boolean): Promise<PurchaseOrder> {
    if (!USE_MOCK) return id ? http.put(`/api/purchase-orders/${id}`, { ...values, place }) : http.post('/api/purchase-orders', { ...values, place })
    await sleep(400)
    let order: PurchaseOrder
    if (id) order = find(id)
    else {
      order = {
        id: `po-${crypto.randomUUID().slice(0, 8)}`,
        code: generateCode('DH'),
        supplierId: '',
        supplierName: '',
        status: 'draft',
        items: [],
        discount: 0,
        note: '',
        expectedDate: now(),
        createdAt: now(),
        createdBy: USER,
        history: [{ label: 'Tạo đơn đặt hàng', at: now(), by: USER }],
        receipts: [],
      }
      MOCK_PURCHASE_ORDERS.unshift(order)
    }
    applyForm(order, values)
    if (id) order.history.push({ label: 'Cập nhật đơn nháp', at: now(), by: USER })
    if (place) {
      order.status = 'ordered'
      order.history.push({ label: 'Gửi đơn cho nhà cung cấp', at: now(), by: USER })
    }
    return structuredClone(order)
  },

  async placeOrder(id: string): Promise<PurchaseOrder> {
    if (!USE_MOCK) return http.post(`/api/purchase-orders/${id}/place`)
    await sleep(300)
    const order = find(id)
    order.status = 'ordered'
    order.history.push({ label: 'Gửi đơn cho nhà cung cấp', at: now(), by: USER })
    return structuredClone(order)
  },

  async cancelOrder(id: string, reason: string): Promise<PurchaseOrder> {
    if (!USE_MOCK) return http.post(`/api/purchase-orders/${id}/cancel`, { reason })
    await sleep(300)
    const order = find(id)
    Object.assign(order, { status: 'cancelled', cancelReason: reason, draftReceipt: undefined })
    order.history.push({ label: `Hủy đơn: ${reason}`, at: now(), by: USER })
    return structuredClone(order)
  },

  async saveReceivingDraft(id: string, draft: ReceivingDraft | null): Promise<PurchaseOrder> {
    if (!USE_MOCK) return http.put(`/api/purchase-orders/${id}/receiving`, draft)
    await sleep(200)
    const order = find(id)
    if (draft) {
      if (order.status !== 'receiving') order.history.push({ label: 'Bắt đầu kiểm đếm hàng', at: now(), by: USER })
      Object.assign(order, { status: 'receiving', draftReceipt: structuredClone(draft) })
    } else {
      Object.assign(order, { status: order.receipts.length ? 'partial' : 'ordered', draftReceipt: undefined })
    }
    return structuredClone(order)
  },

  async completeReceiving(id: string, draft: ReceivingDraft): Promise<{ order: PurchaseOrder; receipt: GoodsReceipt }> {
    if (!USE_MOCK) return http.post(`/api/purchase-orders/${id}/receive`, draft)
    await sleep(700)
    const order = find(id)
    const receipt: GoodsReceipt = {
      id: crypto.randomUUID(),
      code: generateCode('PN'),
      receivedAt: now(),
      receivedBy: USER,
      supplierDocNo: draft.checkIn.supplierDocNo,
      lines: [],
      value: 0,
      note: draft.note,
      approvedBy: draft.approvedBy || undefined,
    }
    for (const line of draft.lines) {
      const qty = acceptedQty(line)
      const product = MOCK_PRODUCTS.find((p) => p.id === line.productId)
      if (qty > 0 && product) {
        const oldCost = product.costPrice ?? line.unitCost
        product.costPrice = Math.round((product.stock * oldCost + qty * line.unitCost) / Math.max(1, product.stock + qty) / 100) * 100
        const lot = [line.lotNo && `Lô ${line.lotNo}`, line.expiryDate && `HSD ${new Date(line.expiryDate).toLocaleDateString('vi-VN')}`].filter(Boolean).join(' · ')
        recordStockMovement(product, 'import', qty, { refCode: receipt.code, reason: `Nhận hàng ${order.code}`, note: lot || undefined })
      }
      if (qty > 0 || line.damagedQty > 0) {
        receipt.lines.push({ productId: line.productId, name: line.name, unit: line.unit, acceptedQty: qty, damagedQty: line.damagedQty, unitCost: line.unitCost, expiryDate: line.expiryDate, lotNo: line.lotNo })
      }
      const item = order.items.find((i) => i.productId === line.productId)
      if (item) {
        item.receivedQty += qty
        item.damagedQty += line.damagedQty
        item.unitCost = line.unitCost
        if (line.shortageAction === 'cancel' && item.receivedQty < item.orderedQty) item.orderedQty = item.receivedQty
      } else if (qty > 0 && product) {
        order.items.push({ productId: product.id, name: product.name, sku: product.sku, barcode: product.barcode, unit: product.unit, categoryId: product.categoryId, image: product.image, imageFit: product.imageFit, orderedQty: qty, unitCost: line.unitCost, packSize: 1, receivedQty: qty, damagedQty: 0 })
      }
    }
    receipt.value = receipt.lines.reduce((s, l) => s + l.acceptedQty * l.unitCost, 0)
    order.receipts.push(receipt)
    const remaining = order.items.some((i) => i.receivedQty < i.orderedQty)
    order.status = remaining ? 'partial' : 'completed'
    order.draftReceipt = undefined
    order.history.push({ label: `${remaining ? 'Nhận một phần' : 'Nhận đủ hàng'} & nhập kho (${receipt.code})`, at: now(), by: USER })
    return { order: structuredClone(order), receipt: structuredClone(receipt) }
  },
}
