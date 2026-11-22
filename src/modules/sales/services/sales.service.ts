import { http, sleep } from '@/lib/http'
import { USE_MOCK } from '@/lib/constants'
import { MOCK_CATEGORIES } from '@/modules/sales/mocks/categories.mock'
import { MOCK_CUSTOMERS } from '@/modules/sales/mocks/customers.mock'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import { MOCK_TODAY_STATS } from '@/modules/sales/mocks/stats.mock'
import type { Category, CreateOrderPayload, Customer, Order, Product, SalesStats, Voucher } from '@/modules/sales/types/sales.types'
import { generateOrderCode } from '@/modules/sales/utils/cart.utils'
import { getRunningAutoSync, promotionsService } from '@/modules/promotions/services/promotions.service'
import { priceCart } from '@/modules/promotions/utils/promotion-engine'
import { MOCK_ORDERS } from '@/modules/orders/mocks/orders.mock'
import { recordStockMovement } from '@/modules/inventory/mocks/movements.mock'
import { sortCategories } from '@/modules/categories/utils/categories.utils'
import { registerCategoryVisuals } from '@/modules/categories/utils/category-visuals'

export const salesService = {
  async getCategories(): Promise<Category[]> {
    const list = USE_MOCK
      ? await sleep(150).then(() => sortCategories(MOCK_CATEGORIES.filter((c) => c.status !== 'inactive')))
      : await http.get<Category[]>('/api/categories', { params: { status: 'active' } })
    registerCategoryVisuals(list)
    return [{ id: 'all', name: 'Tất cả' }, ...list]
  },

  async getProducts(): Promise<Product[]> {
    if (USE_MOCK) {
      const hidden = new Set(MOCK_CATEGORIES.filter((c) => c.status === 'inactive').map((c) => c.id))
      return sleep(500).then(() => structuredClone(MOCK_PRODUCTS.filter((p) => p.status !== 'inactive' && !hidden.has(p.categoryId))))
    }
    return http.get<Product[]>('/api/products', { params: { status: 'active' } })
  },

  async searchCustomers(keyword: string): Promise<Customer[]> {
    if (USE_MOCK) {
      await sleep(120)
      const k = keyword.trim().toLowerCase()
      return MOCK_CUSTOMERS.filter((c) => !k || c.name.toLowerCase().includes(k) || c.phone.includes(k))
    }
    return http.get<Customer[]>('/api/customers', { params: { q: keyword } })
  },

  async getTodayStats(): Promise<SalesStats> {
    if (USE_MOCK) return sleep(300).then(() => ({ ...MOCK_TODAY_STATS }))
    return http.get<SalesStats>('/api/reports/sales/today')
  },

  applyVoucher(code: string, customerId: string | null): Promise<Voucher> {
    return promotionsService.validateVoucher(code, customerId)
  },

  async createOrder(payload: CreateOrderPayload, context: { products: Product[]; customer: Customer | null; voucher: Voucher | null }): Promise<Order> {
    if (!USE_MOCK) return http.post<Order>('/api/orders', payload)

    await sleep(700)
    const items = payload.items.map((i) => {
      const product = context.products.find((p) => p.id === i.productId)!
      return {
        productId: i.productId,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        unit: product.unit,
        categoryId: product.categoryId,
        price: i.price,
        quantity: i.quantity,
        stock: product.stock,
        image: product.image,
        imageFit: product.imageFit,
      }
    })
    const pricing = priceCart({ items, promotions: getRunningAutoSync(), voucher: context.voucher, products: MOCK_PRODUCTS })
    const { subtotal, discountAmount, total } = pricing
    const lines = [
      ...items.map((i) => ({ ...i, discount: pricing.lines[i.productId].discount || undefined, promotionId: pricing.lines[i.productId].promotionId })),
      ...pricing.gifts.map(({ promoName: _, ...g }) => g),
    ]
    const order: Order = {
      id: crypto.randomUUID(),
      code: generateOrderCode(),
      createdAt: new Date().toISOString(),
      customer: context.customer,
      voucher: pricing.voucherDiscount > 0 ? context.voucher : null,
      promotions: pricing.applied,
      items: lines,
      totals: { itemCount: pricing.itemCount, subtotal, discountAmount, total, promoDiscount: pricing.productDiscount + pricing.orderDiscount, voucherDiscount: pricing.voucherDiscount },
      paymentMethod: payload.paymentMethod,
      paidAmount: payload.paidAmount,
      changeAmount: Math.max(0, payload.paidAmount - total),
      note: payload.note,
      cashier: 'Khánh Duy',
    }
    MOCK_ORDERS.unshift({ ...order, status: 'completed', channel: 'pos' })
    order.items.forEach((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId)
      if (product) recordStockMovement(product, 'sale', -item.quantity, { refCode: order.code, createdBy: order.cashier })
    })
    return order
  },
}
