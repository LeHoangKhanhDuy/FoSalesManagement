export type CategoryId = string

export type CategoryStatus = 'active' | 'inactive'

export interface Category {
  id: CategoryId
  name: string
  description?: string
  icon?: string
  color?: string
  status?: CategoryStatus
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export type ImageFit = 'cover' | 'contain' | 'auto'

export interface Product {
  id: string
  sku: string
  barcode: string
  name: string
  categoryId: CategoryId
  price: number
  originalPrice?: number
  unit: string
  stock: number
  isBestSeller?: boolean
  image?: string
  imageFit?: ImageFit
  costPrice?: number
  status?: ProductStatus
  description?: string
  createdAt?: string
  updatedAt?: string
}

export type ProductStatus = 'active' | 'inactive'

export type CustomerTier = 'retail' | 'silver' | 'gold' | 'diamond'

export interface Customer {
  id: string
  name: string
  phone: string
  tier: CustomerTier
  points: number
}

export interface CartItem {
  productId: string
  name: string
  sku: string
  unit: string
  categoryId: Product['categoryId']
  price: number
  quantity: number
  stock: number
  image?: string
  imageFit?: ImageFit
}

export type VoucherType = 'percent' | 'amount'
export interface Voucher {
  code: string
  name: string
  type: VoucherType
  value: number
  maxDiscount?: number
  minOrder?: number
  expiresAt?: string
}

export interface Invoice {
  id: string
  name: string
  items: CartItem[]
  customer: Customer | null
  voucher: Voucher | null
  note: string
  createdAt: string
}

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'ewallet'

export interface InvoiceTotals {
  itemCount: number
  subtotal: number
  discountAmount: number
  total: number
}

export interface CreateOrderPayload {
  items: Pick<CartItem, 'productId' | 'price' | 'quantity'>[]
  customerId: string | null
  voucherCode: string | null
  note: string
  paymentMethod: PaymentMethod
  paidAmount: number
}

export interface Order {
  id: string
  code: string
  createdAt: string
  customer: Customer | null
  voucher: Voucher | null
  items: CartItem[]
  totals: InvoiceTotals
  paymentMethod: PaymentMethod
  paidAmount: number
  changeAmount: number
  note: string
  cashier: string
}

export interface SalesStats {
  revenue: number
  revenueGrowth: number
  orders: number
  ordersGrowth: number
  itemsSold: number
  itemsSoldGrowth: number
  customers: number
  customersGrowth: number
}
