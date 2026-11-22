import type { Discount, Invoice, InvoiceTotals, Product, CartItem } from '@/modules/sales/types/sales.types'

export const createInvoice = (index: number): Invoice => ({
  id: crypto.randomUUID(),
  name: `Hóa đơn ${index}`,
  items: [],
  customer: null,
  discount: { type: 'amount', value: 0 },
  note: '',
  createdAt: new Date().toISOString(),
})

export const productToCartItem = (product: Product): CartItem => ({
  productId: product.id,
  name: product.name,
  sku: product.sku,
  unit: product.unit,
  categoryId: product.categoryId,
  price: product.price,
  quantity: 1,
  stock: product.stock,
  image: product.image,
  imageFit: product.imageFit,
})

export const calcDiscountAmount = (subtotal: number, discount: Discount) => {
  const raw = discount.type === 'percent' ? (subtotal * Math.min(discount.value, 100)) / 100 : discount.value
  return Math.max(0, Math.min(Math.round(raw), subtotal))
}

export const calcTotals = (invoice: Invoice): InvoiceTotals => {
  const subtotal = invoice.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = invoice.items.reduce((sum, i) => sum + i.quantity, 0)
  const discountAmount = calcDiscountAmount(subtotal, invoice.discount)
  return { itemCount, subtotal, discountAmount, total: subtotal - discountAmount }
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
