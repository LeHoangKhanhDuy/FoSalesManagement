import { MOCK_SUPPLIERS } from '@/modules/purchasing/mocks/suppliers.mock'
import type { GoodsReceipt, PurchaseOrder, PurchaseOrderStatus } from '@/modules/purchasing/types/purchasing.types'
import { productToPoItem } from '@/modules/purchasing/utils/purchasing.utils'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'

const DAY = 86_400_000
const iso = (daysAgo: number, hour = 9) => {
  const d = new Date(Date.now() - daysAgo * DAY)
  d.setHours(hour, 15, 0, 0)
  return d.toISOString()
}
const ymd = (daysAgo: number) => {
  const d = new Date(Date.now() - daysAgo * DAY)
  return `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

interface Seed {
  supplier: number
  skus: [string, number][]
  status: PurchaseOrderStatus
  createdDaysAgo: number
  expectedIn: number
  receivedRatio?: number
  discount?: number
  note?: string
}

const SEEDS: Seed[] = [
  { supplier: 0, skus: [['SP0001', 96], ['SP0002', 48], ['SP0004', 48], ['SP0005', 24]], status: 'ordered', createdDaysAgo: 1, expectedIn: 1, note: 'Giao buổi sáng trước 10h' },
  { supplier: 1, skus: [['SP0011', 36], ['SP0012', 24], ['SP0013', 30], ['SP0014', 12]], status: 'ordered', createdDaysAgo: 4, expectedIn: -1 },
  { supplier: 2, skus: [['SP0007', 30], ['SP0008', 60], ['SP0009', 12], ['SP0010', 24]], status: 'partial', createdDaysAgo: 6, expectedIn: -3, receivedRatio: 0.6 },
  { supplier: 3, skus: [['SP0019', 20], ['SP0020', 30], ['SP0021', 15]], status: 'draft', createdDaysAgo: 0, expectedIn: 2 },
  { supplier: 4, skus: [['SP0022', 12], ['SP0023', 36], ['SP0024', 12], ['SP0025', 24]], status: 'draft', createdDaysAgo: 0, expectedIn: 3 },
  { supplier: 0, skus: [['SP0003', 120], ['SP0006', 24]], status: 'completed', createdDaysAgo: 9, expectedIn: -7, receivedRatio: 1, discount: 50_000 },
  { supplier: 2, skus: [['SP0015', 300], ['SP0016', 90], ['SP0017', 60]], status: 'completed', createdDaysAgo: 14, expectedIn: -12, receivedRatio: 1 },
  { supplier: 1, skus: [['SP0011', 48], ['SP0013', 30]], status: 'completed', createdDaysAgo: 18, expectedIn: -16, receivedRatio: 1 },
  { supplier: 4, skus: [['SP0026', 30], ['SP0027', 20], ['SP0028', 24]], status: 'partial', createdDaysAgo: 11, expectedIn: -8, receivedRatio: 0.5 },
  { supplier: 3, skus: [['SP0019', 25], ['SP0020', 40]], status: 'cancelled', createdDaysAgo: 7, expectedIn: -5 },
  { supplier: 2, skus: [['SP0018', 20]], status: 'completed', createdDaysAgo: 24, expectedIn: -22, receivedRatio: 1 },
]

const buildOrder = (seed: Seed, index: number): PurchaseOrder => {
  const supplier = MOCK_SUPPLIERS[seed.supplier]
  const items = seed.skus
    .map(([sku, qty]) => {
      const product = MOCK_PRODUCTS.find((p) => p.sku === sku)
      return product ? productToPoItem(product, qty) : null
    })
    .filter((i): i is NonNullable<typeof i> => !!i)
  const created = iso(seed.createdDaysAgo, 8)
  const history = [{ label: 'Tạo đơn đặt hàng', at: created, by: 'Khánh Duy' }]
  if (seed.status !== 'draft') history.push({ label: 'Gửi đơn cho nhà cung cấp', at: iso(seed.createdDaysAgo, 9), by: 'Khánh Duy' })
  const receipts: GoodsReceipt[] = []
  if (seed.receivedRatio) {
    const receivedDay = Math.max(0, -seed.expectedIn)
    items.forEach((i, k) => {
      const ratio = seed.receivedRatio! < 1 && k % 2 === 1 ? 0 : seed.receivedRatio!
      i.receivedQty = Math.round(i.orderedQty * ratio)
    })
    const lines = items
      .filter((i) => i.receivedQty > 0)
      .map((i) => ({ productId: i.productId, name: i.name, sku: i.sku, barcode: i.barcode, unit: i.unit, acceptedQty: i.receivedQty, damagedQty: 0, unitCost: i.unitCost }))
    receipts.push({
      id: `gr-${index}`,
      code: `PN${ymd(receivedDay)}-${String(2100 + index * 37).slice(-4)}`,
      receivedAt: iso(receivedDay, 7),
      receivedBy: 'Minh Thư',
      supplierDocNo: `HĐ${String(10230 + index * 11)}`,
      lines,
      value: lines.reduce((s, l) => s + l.acceptedQty * l.unitCost, 0) - (seed.status === 'completed' ? (seed.discount ?? 0) : 0),
      note: '',
    })
    history.push({ label: seed.status === 'completed' ? 'Nhận đủ hàng & nhập kho' : 'Nhận một phần & nhập kho', at: iso(receivedDay, 7), by: 'Minh Thư' })
  }
  if (seed.status === 'cancelled') history.push({ label: 'Hủy đơn đặt hàng', at: iso(seed.createdDaysAgo - 1, 15), by: 'Khánh Duy' })
  return {
    id: `po-${String(index + 1).padStart(3, '0')}`,
    code: `DH${ymd(seed.createdDaysAgo)}-${String(1000 + index * 173).slice(-4)}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    status: seed.status,
    items,
    discount: seed.discount ?? 0,
    note: seed.note ?? '',
    expectedDate: iso(-seed.expectedIn, 8),
    createdAt: created,
    createdBy: 'Khánh Duy',
    history,
    receipts,
    cancelReason: seed.status === 'cancelled' ? 'Nhà cung cấp hết hàng' : undefined,
  }
}

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = SEEDS.map(buildOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
