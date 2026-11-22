import { MOCK_PURCHASE_ORDERS } from '@/modules/purchasing/mocks/purchase-orders.mock'
import type { SupplierPayment } from '@/modules/suppliers/types/suppliers.types'

const DAY = 86_400_000
const receiptsOf = (supplierId: string) =>
  MOCK_PURCHASE_ORDERS.filter((o) => o.supplierId === supplierId)
    .flatMap((o) => o.receipts)
    .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))

const payment = (supplierId: string, index: number, amount: number, at: string, method: SupplierPayment['method'], note: string): SupplierPayment => {
  const d = new Date(at)
  return {
    id: `pay-${supplierId}-${index}`,
    code: `PC${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(3100 + index * 47).slice(-4)}`,
    supplierId,
    amount,
    method,
    reference: method === 'transfer' ? `FT${String(26000000 + index * 7331)}` : undefined,
    note,
    paidAt: at,
    paidBy: 'Khánh Duy',
  }
}

const after = (iso: string, days: number) => new Date(Math.min(Date.now() - DAY / 2, new Date(iso).getTime() + days * DAY)).toISOString()

const seed = (): SupplierPayment[] => {
  const list: SupplierPayment[] = []
  receiptsOf('sup-02').forEach((r, i) => list.push(payment('sup-02', i, r.value, after(r.receivedAt, 5), 'transfer', `Thanh toán ${r.code}`)))
  const hb = receiptsOf('sup-03')[0]
  if (hb) list.push(payment('sup-03', 10, hb.value, after(hb.receivedAt, 9), 'transfer', `Thanh toán ${hb.code}`))
  const hmp = receiptsOf('sup-05')[0]
  if (hmp) list.push(payment('sup-05', 20, Math.round((hmp.value * 0.4) / 100_000) * 100_000, after(hmp.receivedAt, 1), 'cash', 'Trả trước một phần'))
  return list.sort((a, b) => b.paidAt.localeCompare(a.paidAt))
}

export const MOCK_SUPPLIER_PAYMENTS: SupplierPayment[] = seed()
