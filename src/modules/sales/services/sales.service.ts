import { http, sleep } from '@/lib/http'
import { USE_MOCK } from '@/lib/constants'
import { authStore } from '@/modules/auth/utils/auth.utils'
import { categoryService } from '@/modules/categories/services/category.service'
import { productsService } from '@/modules/products/services/products.service'
import { customersService } from '@/modules/customers/services/customers.service'
import { MOCK_CUSTOMERS } from '@/modules/customers/mocks/customers.mock'
import { MOCK_MEMBERSHIP } from '@/modules/customers/mocks/membership.mock'
import { earnOrderPoints } from '@/modules/customers/mocks/points.mock'
import { tierConfig } from '@/modules/customers/utils/customers.utils'
import { MOCK_TODAY_STATS } from '@/modules/sales/mocks/stats.mock'
import type { Category, CreateOrderPayload, Customer, Order, Product, SalesStats, Voucher } from '@/modules/sales/types/sales.types'
import { generateOrderCode } from '@/modules/sales/utils/cart.utils'
import { getRunningAutoSync, promotionsService } from '@/modules/promotions/services/promotions.service'
import { priceCart } from '@/modules/promotions/utils/promotion-engine'
import { MOCK_ORDERS } from '@/modules/orders/mocks/orders.mock'

export const salesService = {
  async getCategories(): Promise<Category[]> {
    const list = await categoryService.list({ status: 'active' })
    return [{ id: 'all', name: 'Tất cả' }, ...list]
  },

  getProducts: (): Promise<Product[]> => productsService.sellable(),

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
    const pricing = priceCart({ items, promotions: getRunningAutoSync(), voucher: context.voucher, member, products: context.products })
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
      cashier: authStore.get()?.user.name ?? '',
    }
    MOCK_ORDERS.unshift({ ...order, status: 'completed', channel: 'pos' })
    order.pointsEarned = earnOrderPoints(order)
    MOCK_ORDERS[0].pointsEarned = order.pointsEarned
    if (live) order.customer = { ...live }
    return order
  },
}
