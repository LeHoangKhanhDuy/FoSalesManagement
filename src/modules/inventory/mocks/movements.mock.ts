import { MOCK_ORDERS } from '@/modules/orders/mocks/orders.mock'
import type { MovementType, StockMovement } from '@/modules/inventory/types/inventory.types'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import type { Product } from '@/modules/sales/types/sales.types'

type Draft = Omit<StockMovement, 'id' | 'before' | 'after' | 'productName' | 'sku' | 'unit'>

const DAY = 86_400_000
const STAFF = ['Khánh Duy', 'Minh Thư', 'Quốc Huy']

const createRandom = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

const buildHistory = (): StockMovement[] => {
  const rand = createRandom(7331)
  const now = Date.now()
  const drafts: Draft[] = []

  for (const order of MOCK_ORDERS) {
    if (order.status === 'pending' || order.status === 'cancelled') continue
    for (const item of order.items) {
      drafts.push({ productId: item.productId, type: 'sale', quantity: -item.quantity, refCode: order.code, createdBy: order.cashier, createdAt: order.createdAt })
      if (order.status === 'refunded') {
        drafts.push({
          productId: item.productId,
          type: 'return',
          quantity: item.quantity,
          reason: order.reason,
          refCode: order.code,
          createdBy: order.cashier,
          createdAt: new Date(new Date(order.createdAt).getTime() + 3_600_000).toISOString(),
        })
      }
    }
  }

  MOCK_PRODUCTS.forEach((p) => {
    if (rand() < 0.3) {
      drafts.push({
        productId: p.id,
        type: 'adjust-out',
        quantity: -(1 + Math.floor(rand() * 3)),
        reason: rand() < 0.5 ? 'Hư hỏng' : 'Hết hạn sử dụng',
        createdBy: STAFF[Math.floor(rand() * STAFF.length)],
        createdAt: new Date(now - Math.floor(rand() * 25) * DAY - 5 * 3_600_000).toISOString(),
      })
    }
  })

  const byProduct = new Map<string, Draft[]>()
  drafts.forEach((d) => byProduct.set(d.productId, [...(byProduct.get(d.productId) ?? []), d]))

  const simulate = (product: Product, list: Draft[], initial: number) => {
    const all: Draft[] = [
      { productId: product.id, type: 'initial', quantity: initial, reason: 'Tồn đầu kỳ', createdBy: 'Hệ thống', createdAt: new Date(now - 36 * DAY).toISOString() },
    ]
    let running = initial
    let seq = 0
    for (const d of list) {
      if (d.quantity < 0 && running + d.quantity < 3) {
        const at = new Date(new Date(d.createdAt).getTime() - (2 + Math.floor(rand() * 20)) * 3_600_000)
        at.setMinutes(30, 0, 0)
        const qty = Math.ceil((-(running + d.quantity) + 12 + rand() * 30) / 6) * 6
        const ymd = `${String(at.getFullYear()).slice(-2)}${String(at.getMonth() + 1).padStart(2, '0')}${String(at.getDate()).padStart(2, '0')}`
        all.push({ productId: product.id, type: 'import', quantity: qty, refCode: `PN${ymd}-${product.sku.slice(-3)}${seq++}`, createdBy: 'Khánh Duy', createdAt: at.toISOString() })
        running += qty
      }
      all.push(d)
      running += d.quantity
    }
    return { all, final: running }
  }

  const result: StockMovement[] = []
  for (const product of MOCK_PRODUCTS) {
    const list = (byProduct.get(product.id) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    let initial = 8 + Math.floor(rand() * 16)
    let sim = simulate(product, list, initial)
    for (let i = 0; i < 6 && sim.final > product.stock && initial > 0; i++) {
      initial = Math.max(0, initial + product.stock - sim.final)
      sim = simulate(product, list, initial)
    }
    const all = sim.all
    if (sim.final < product.stock) {
      const at = new Date(now - (3 + Math.floor(rand() * 10)) * DAY)
      at.setHours(7, 30, 0, 0)
      const ymd = `${String(at.getFullYear()).slice(-2)}${String(at.getMonth() + 1).padStart(2, '0')}${String(at.getDate()).padStart(2, '0')}`
      all.push({ productId: product.id, type: 'import', quantity: product.stock - sim.final, refCode: `PN${ymd}-${product.sku.slice(-3)}`, createdBy: 'Khánh Duy', createdAt: at.toISOString() })
      sim.final = product.stock
    }
    if (sim.final !== product.stock) {
      const last = new Date(all[all.length - 1].createdAt).getTime()
      all.push({
        productId: product.id,
        type: sim.final > product.stock ? 'adjust-out' : 'adjust-in',
        quantity: product.stock - sim.final,
        reason: 'Kiểm kho định kỳ',
        createdBy: 'Khánh Duy',
        createdAt: new Date(Math.min(now - 60_000, last + 1_800_000)).toISOString(),
      })
    }
    let stock = 0
    all
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach((d, i) => {
        const before = stock
        stock += d.quantity
        result.push({ ...d, id: `${product.id}-m${i}`, productName: product.name, sku: product.sku, unit: product.unit, before, after: stock })
      })
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const MOCK_MOVEMENTS: StockMovement[] = buildHistory()

export const recordStockMovement = (
  product: Product,
  type: MovementType,
  quantity: number,
  extra: Partial<Pick<StockMovement, 'reason' | 'note' | 'refCode' | 'createdBy'>> = {},
) => {
  const before = product.stock
  product.stock = Math.max(0, before + quantity)
  const movement: StockMovement = {
    id: `mv-${crypto.randomUUID().slice(0, 8)}`,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    unit: product.unit,
    type,
    quantity: product.stock - before,
    before,
    after: product.stock,
    createdBy: extra.createdBy ?? 'Khánh Duy',
    createdAt: new Date().toISOString(),
    ...extra,
  }
  MOCK_MOVEMENTS.unshift(movement)
  return movement
}
