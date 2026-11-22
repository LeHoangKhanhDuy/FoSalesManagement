import { MOCK_CUSTOMERS } from '@/modules/sales/mocks/customers.mock'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import { MOCK_PROMOTIONS } from '@/modules/promotions/mocks/promotions.mock'
import { priceCart } from '@/modules/promotions/utils/promotion-engine'
import { isRunningAt, toVoucher } from '@/modules/promotions/utils/promotions.utils'
import type { CartItem, PaymentMethod } from '@/modules/sales/types/sales.types'
import { suggestCashAmounts } from '@/modules/sales/utils/cart.utils'
import type { OrderRecord, OrderStatus } from '@/modules/orders/types/orders.types'

const createRandom = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

const CASHIERS = ['Khánh Duy', 'Minh Thư', 'Quốc Huy']
const NOTES = ['', '', '', '', 'Khách lấy túi riêng', 'Giao trước 17h', 'Xuất hóa đơn VAT']

const generateOrders = (count: number): OrderRecord[] => {
  const rand = createRandom(20261122)
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]
  const now = Date.now()
  const products = MOCK_PRODUCTS.filter((p) => p.stock > 0 && p.status !== 'inactive' && p.sku !== 'SP0014')
  const orders: OrderRecord[] = []

  for (let n = 0; n < count; n++) {
    const day = Math.floor(rand() * 35)
    const date = new Date(now - day * 86_400_000)
    date.setHours(7 + Math.floor(rand() * 15), Math.floor(rand() * 60), Math.floor(rand() * 60), 0)
    if (date.getTime() > now) date.setTime(now - Math.floor(rand() * 3_600_000))

    const lines = new Map<string, CartItem>()
    const lineCount = 1 + Math.floor(rand() * 5)
    for (let i = 0; i < lineCount; i++) {
      const p = pick(products)
      const qty = 1 + Math.floor(rand() * 3)
      const existing = lines.get(p.id)
      lines.set(p.id, {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        unit: p.unit,
        categoryId: p.categoryId,
        price: p.price,
        quantity: (existing?.quantity ?? 0) + qty,
        stock: p.stock,
        image: p.image,
        imageFit: p.imageFit,
      })
    }
    const cart = [...lines.values()]
    const running = MOCK_PROMOTIONS.filter((p) => isRunningAt(p, date.getTime()))
    const vouchers = running.filter((p) => p.kind === 'voucher')
    const candidate = vouchers.length && rand() < 0.25 ? toVoucher(pick(vouchers)) : null
    const pricing = priceCart({ items: cart, promotions: running.filter((p) => p.kind !== 'voucher'), voucher: candidate, products: MOCK_PRODUCTS })
    const items = [...cart.map((i) => ({ ...i, discount: pricing.lines[i.productId].discount || undefined, promotionId: pricing.lines[i.productId].promotionId })), ...pricing.gifts.map(({ promoName: _, ...g }) => g)]
    const { subtotal, discountAmount, total } = pricing

    const r = rand()
    const status: OrderStatus = r < 0.8 ? 'completed' : r < 0.88 ? 'pending' : r < 0.94 ? 'cancelled' : 'refunded'
    const pm = rand()
    const paymentMethod: PaymentMethod =
      status === 'pending' ? 'transfer' : pm < 0.5 ? 'cash' : pm < 0.8 ? 'transfer' : pm < 0.9 ? 'card' : 'ewallet'
    const paidAmount = status === 'pending' ? 0 : paymentMethod === 'cash' ? pick(suggestCashAmounts(total, 3)) : total
    const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, '')

    orders.push({
      id: `ord-${String(n + 1).padStart(4, '0')}`,
      code: `HD${yymmdd}-${String(1000 + Math.floor(rand() * 9000))}`,
      createdAt: date.toISOString(),
      customer: rand() < 0.55 ? pick(MOCK_CUSTOMERS) : null,
      voucher: pricing.voucherDiscount > 0 ? candidate : null,
      promotions: pricing.applied,
      items,
      totals: { itemCount: pricing.itemCount, subtotal, discountAmount, total, promoDiscount: pricing.productDiscount + pricing.orderDiscount, voucherDiscount: pricing.voucherDiscount },
      paymentMethod,
      paidAmount,
      changeAmount: Math.max(0, paidAmount - total),
      note: pick(NOTES),
      cashier: pick(CASHIERS),
      status,
      channel: rand() < 0.85 ? 'pos' : 'online',
      reason:
        status === 'cancelled' ? pick(['Khách đổi ý', 'Nhập sai đơn']) : status === 'refunded' ? pick(['Sản phẩm lỗi', 'Khách trả hàng']) : undefined,
    })
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const MOCK_ORDERS: OrderRecord[] = generateOrders(86)
