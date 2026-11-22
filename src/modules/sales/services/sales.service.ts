import { http, sleep } from '@/lib/http'
import { USE_MOCK } from '@/lib/constants'
import { MOCK_CATEGORIES } from '@/modules/sales/mocks/categories.mock'
import { customersService } from '@/modules/customers/services/customers.service'
import { MOCK_CUSTOMERS } from '@/modules/customers/mocks/customers.mock'
import { MOCK_MEMBERSHIP } from '@/modules/customers/mocks/membership.mock'
import { earnOrderPoints } from '@/modules/customers/mocks/points.mock'
import { tierConfig } from '@/modules/customers/utils/customers.utils'
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

  searchCustomers(keyword: string): Promise<Customer[]> {
    return customersService.searchActive(keyword)
  },

  quickCreateCustomer(name: string, phone: string): Promise<Customer> {
    return customersService.saveCustomer(null, { name, phone, status: 'active' })
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
    const live = MOCK_CUSTOMERS.find((c) => c.id === context.customer?.id)
    const tier = live ? tierConfig(MOCK_MEMBERSHIP, live.tier) : null
    const member = tier && tier.discountPercent > 0 ? { tier: tier.tier, label: tier.label, discountPercent: tier.discountPercent } : null
    const pricing = priceCart({ items, promotions: getRunningAutoSync(), voucher: context.voucher, member, products: MOCK_PRODUCTS })
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
      totals: { itemCount: pricing.itemCount, subtotal, discountAmount, total, promoDiscount: pricing.productDiscount + pricing.orderDiscount, voucherDiscount: pricing.voucherDiscount, memberDiscount: pricing.memberDiscount },
      paymentMethod: payload.paymentMethod,
      paidAmount: payload.paidAmount,
      changeAmount: Math.max(0, payload.paidAmount - total),
      note: payload.note,
      cashier: 'Khánh Duy',
    }
    MOCK_ORDERS.unshift({ ...order, status: 'completed', channel: 'pos' })
    order.pointsEarned = earnOrderPoints(order)
    MOCK_ORDERS[0].pointsEarned = order.pointsEarned
    if (live) order.customer = { ...live }
    order.items.forEach((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId)
      if (product) recordStockMovement(product, 'sale', -item.quantity, { refCode: order.code, createdBy: order.cashier })
    })
    return order
  },
}
