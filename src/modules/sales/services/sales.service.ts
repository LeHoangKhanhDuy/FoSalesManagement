import { categoryService } from '@/modules/categories/services/category.service'
import { customersService } from '@/modules/customers/services/customers.service'
import { productsService } from '@/modules/products/services/products.service'
import { promotionsService } from '@/modules/promotions/services/promotions.service'
import type { Category, Customer, Product, Voucher } from '@/modules/sales/types/sales.types'

export const salesService = {
  async getCategories(): Promise<Category[]> {
    const list = await categoryService.list({ status: 'active' })
    return [{ id: 'all', name: 'Tất cả' }, ...list]
  },

  getProducts: (): Promise<Product[]> => productsService.sellable(),

  searchCustomers: (keyword: string): Promise<Customer[]> => customersService.searchActive(keyword),

  quickCreateCustomer: (name: string, phone: string): Promise<Customer> => customersService.quickCreate(name, phone),

  applyVoucher: (code: string, customerId: string | null, cartTotal: number): Promise<Voucher> => promotionsService.validateVoucher(code, customerId, cartTotal),
}
