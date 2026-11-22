import { formatCurrency } from '@/lib/format'
import type { Promotion } from '@/modules/promotions/types/promotions.types'
import { calcDiscount, inScope } from '@/modules/promotions/utils/promotions.utils'
import type { AppliedPromotion, CartItem, Product, Voucher } from '@/modules/sales/types/sales.types'

export interface PricedLine {
  discount: number
  promotionId?: string
  promoName?: string
}

export interface GiftLine extends CartItem {
  promoName: string
}

export interface CartPricing {
  lines: Record<string, PricedLine>
  gifts: GiftLine[]
  applied: AppliedPromotion[]
  itemCount: number
  subtotal: number
  productDiscount: number
  orderDiscount: number
  memberDiscount: number
  voucherDiscount: number
  discountAmount: number
  total: number
  voucherIssue?: string
}

interface PriceCartInput {
  items: CartItem[]
  promotions: Promotion[]
  voucher: Voucher | null
  member?: { tier: string; label: string; discountPercent: number } | null
  products: Pick<Product, 'id' | 'name' | 'sku' | 'barcode' | 'unit' | 'categoryId' | 'stock' | 'price' | 'image' | 'imageFit'>[]
}

export function priceCart({ items, promotions, voucher, member, products }: PriceCartInput): CartPricing {
  const applied = new Map<string, AppliedPromotion>()
  const addApplied = (p: Promotion, amount: number) => {
    const cur = applied.get(p.id)
    applied.set(p.id, { id: p.id, code: p.code, name: p.name, kind: p.kind, amount: (cur?.amount ?? 0) + amount })
  }

  const lines: Record<string, PricedLine> = {}
  let subtotal = 0
  let productDiscount = 0
  for (const item of items) {
    const gross = item.price * item.quantity
    subtotal += gross
    let best: { promo: Promotion; unit: number } | null = null
    for (const p of promotions) {
      if (p.kind !== 'product' || !inScope(p.scope, item)) continue
      const unit = calcDiscount(item.price, p.discountType, p.discountValue)
      if (unit > 0 && (!best || unit > best.unit)) best = { promo: p, unit }
    }
    const discount = best ? best.unit * item.quantity : 0
    lines[item.productId] = { discount, promotionId: best?.promo.id, promoName: best?.promo.name }
    productDiscount += discount
    if (best) addApplied(best.promo, discount)
  }

  const gifts: GiftLine[] = []
  for (const p of promotions) {
    if (p.kind !== 'gift' || !p.buyProductId || !p.giftProductId) continue
    const bought = items.find((i) => i.productId === p.buyProductId)
    const product = products.find((x) => x.id === p.giftProductId)
    if (!bought || !product) continue
    const sets = Math.floor(bought.quantity / Math.max(1, p.buyQty ?? 1))
    const reserved = (items.find((i) => i.productId === product.id)?.quantity ?? 0) + gifts.filter((g) => g.productId === product.id).reduce((s, g) => s + g.quantity, 0)
    const quantity = Math.min(sets * Math.max(1, p.giftQty ?? 1), Math.max(0, product.stock - reserved))
    if (quantity <= 0) continue
    gifts.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      unit: product.unit,
      categoryId: product.categoryId,
      price: 0,
      quantity,
      stock: product.stock,
      image: product.image,
      imageFit: product.imageFit,
      isGift: true,
      promotionId: p.id,
      promoName: p.name,
    })
    addApplied(p, quantity * product.price)
  }

  const afterItems = subtotal - productDiscount
  let order: { promo: Promotion; amount: number } | null = null
  for (const p of promotions) {
    if (p.kind !== 'order' || afterItems < (p.minOrder ?? 0)) continue
    const amount = calcDiscount(afterItems, p.discountType, p.discountValue, p.maxDiscount)
    if (amount > 0 && (!order || amount > order.amount)) order = { promo: p, amount }
  }

  let voucherDiscount = 0
  let voucherIssue: string | undefined
  if (voucher && items.length) {
    const eligible = items.filter((i) => inScope(voucher.scope, i)).reduce((s, i) => s + i.price * i.quantity - lines[i.productId].discount, 0)
    const missing = (voucher.minOrder ?? 0) - afterItems
    if (!eligible) voucherIssue = 'Giỏ hàng chưa có sản phẩm thuộc phạm vi áp dụng của mã'
    else if (missing > 0) voucherIssue = `Mua thêm ${formatCurrency(missing)} để được áp dụng`
    else {
      voucherDiscount = calcDiscount(eligible, voucher.type, voucher.value, voucher.maxDiscount)
      if (order && voucher.stackable === false) {
        if (voucherDiscount >= order.amount) order = null
        else {
          voucherIssue = `Không dùng chung với "${order.promo.name}" đang có lợi hơn`
          voucherDiscount = 0
        }
      }
    }
  }

  const orderDiscount = order?.amount ?? 0
  if (order) addApplied(order.promo, orderDiscount)
  const memberDiscount = member && member.discountPercent > 0 && items.length ? calcDiscount(afterItems - orderDiscount, 'percent', member.discountPercent) : 0
  if (member && memberDiscount > 0) applied.set(`member-${member.tier}`, { id: `member-${member.tier}`, code: member.tier.toUpperCase(), name: `Ưu đãi hạng ${member.label}`, kind: 'member', amount: memberDiscount })
  voucherDiscount = Math.min(voucherDiscount, afterItems - orderDiscount - memberDiscount)
  if (voucher && voucherDiscount > 0) applied.set(voucher.id ?? voucher.code, { id: voucher.id ?? voucher.code, code: voucher.code, name: voucher.name, kind: 'voucher', amount: voucherDiscount })

  const discountAmount = productDiscount + orderDiscount + memberDiscount + voucherDiscount
  return {
    lines,
    gifts,
    applied: [...applied.values()],
    itemCount: items.reduce((s, i) => s + i.quantity, 0) + gifts.reduce((s, g) => s + g.quantity, 0),
    subtotal,
    productDiscount,
    orderDiscount,
    memberDiscount,
    voucherDiscount,
    discountAmount,
    total: subtotal - discountAmount,
    voucherIssue,
  }
}
