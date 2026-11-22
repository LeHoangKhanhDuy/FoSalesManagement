import { formatCurrency } from '@/lib/format'
import type { CartItem, Invoice, Product, Voucher } from '@/modules/sales/types/sales.types'

export const createInvoice = (index: number): Invoice => ({
  id: crypto.randomUUID(),
  name: `Hóa đơn ${index}`,
  items: [],
  customer: null,
  voucher: null,
  note: '',
  createdAt: new Date().toISOString(),
})

export const productToCartItem = (product: Product): CartItem => ({
  productId: product.id,
  name: product.name,
  sku: product.sku,
  barcode: product.barcode,
  unit: product.unit,
  categoryId: product.categoryId,
  price: product.price,
  quantity: 1,
  stock: product.stock,
  image: product.image,
  imageFit: product.imageFit,
})

export const describeVoucher = (voucher: Voucher) => {
  const parts = [voucher.type === 'percent' ? `Giảm ${voucher.value}%` : `Giảm ${formatCurrency(voucher.value)}`]
  if (voucher.type === 'percent' && voucher.maxDiscount) parts[0] += `, tối đa ${formatCurrency(voucher.maxDiscount)}`
  if (voucher.minOrder) parts.push(`Đơn từ ${formatCurrency(voucher.minOrder)}`)
  if (voucher.scope && voucher.scope.type !== 'all') parts.push('Áp dụng một số sản phẩm')
  return parts.join(' · ')
}

export const suggestCashAmounts = (total: number, limit = 6) => {
  if (total <= 0) return []
  const steps = [10_000, 50_000, 100_000, 200_000, 500_000]
  const set = new Set<number>([total])
  steps.forEach((step) => set.add(Math.ceil(total / step) * step))
  return [...set].sort((a, b) => a - b).slice(0, limit)
}

export const generateOrderCode = (date = new Date()) => {
  const y = String(date.getFullYear()).slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `HD${y}${m}${d}-${rand}`
}
