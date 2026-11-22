import { useMemo, useState } from 'react'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import type { Supplier, SupplierPayment } from '@/modules/suppliers/types/suppliers.types'
import { buildLedger, topProducts } from '@/modules/suppliers/utils/suppliers.utils'

export type SupplierDetailTab = 'ledger' | 'orders' | 'products'

export function useSupplierDetail(supplier: Supplier | null, orders: PurchaseOrder[], payments: SupplierPayment[]) {
  const [tab, setTab] = useState<SupplierDetailTab>('ledger')
  const id = supplier?.id ?? ''
  const ledger = useMemo(() => (id ? buildLedger(id, orders, payments) : []), [id, orders, payments])
  const supplierOrders = useMemo(() => orders.filter((o) => o.supplierId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [id, orders])
  const products = useMemo(() => (id ? topProducts(id, orders) : []), [id, orders])
  return { tab, setTab, ledger, orders: supplierOrders, products }
}
