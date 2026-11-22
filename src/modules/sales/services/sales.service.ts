import { http, sleep } from '@/lib/http'
import { USE_MOCK } from '@/lib/constants'
import { MOCK_CATEGORIES } from '@/modules/sales/mocks/categories.mock'
import { MOCK_CUSTOMERS } from '@/modules/sales/mocks/customers.mock'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import { MOCK_TODAY_STATS } from '@/modules/sales/mocks/stats.mock'
import type { Category, CreateOrderPayload, Customer, Order, Product, SalesStats, Voucher } from '@/modules/sales/types/sales.types'
import { calcVoucherDiscount, generateOrderCode } from '@/modules/sales/utils/cart.utils'
import { MOCK_VOUCHERS } from '@/modules/sales/mocks/vouchers.mock'

export const salesService = {
  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) return sleep(150).then(() => MOCK_CATEGORIES)
    return http.get<Category[]>('/api/categories')
  },

  async getProducts(): Promise<Product[]> {
    if (USE_MOCK) return sleep(500).then(() => structuredClone(MOCK_PRODUCTS))
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

  async applyVoucher(code: string, subtotal: number): Promise<Voucher> {
    if (!USE_MOCK) return http.post<Voucher>('/api/vouchers/validate', { code, subtotal })

    await sleep(350)
    const voucher = MOCK_VOUCHERS.find((v) => v.code === code.trim().toUpperCase())
    if (!voucher) throw new Error('Mã giảm giá không tồn tại')
    if (voucher.expiresAt && new Date(`${voucher.expiresAt}T23:59:59`) < new Date()) throw new Error('Mã giảm giá đã hết hạn')
    return voucher
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
        unit: product.unit,
        categoryId: product.categoryId,
        price: i.price,
        quantity: i.quantity,
        stock: product.stock,
        image: product.image,
        imageFit: product.imageFit,
      }
    })
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const discountAmount = calcVoucherDiscount(subtotal, context.voucher)
    const total = subtotal - discountAmount
    return {
      id: crypto.randomUUID(),
      code: generateOrderCode(),
      createdAt: new Date().toISOString(),
      customer: context.customer,
      voucher: discountAmount > 0 ? context.voucher : null,
      items,
      totals: { itemCount: items.reduce((s, i) => s + i.quantity, 0), subtotal, discountAmount, total },
      paymentMethod: payload.paymentMethod,
      paidAmount: payload.paidAmount,
      changeAmount: Math.max(0, payload.paidAmount - total),
      note: payload.note,
      cashier: 'Khánh Duy',
    }
  },
}
