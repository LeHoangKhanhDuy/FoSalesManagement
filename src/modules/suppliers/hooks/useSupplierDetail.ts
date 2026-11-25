import { useMemo, useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { purchasingService } from '@/modules/purchasing/services/purchasing.service'
import { suppliersService } from '@/modules/suppliers/services/suppliers.service'

export type SupplierDetailTab = 'ledger' | 'orders' | 'products'

const fetchLedger = (id: string) => suppliersService.ledger(id)
const fetchProducts = (id: string) => suppliersService.topProducts(id)
const fetchOrders = () => purchasingService.getPurchaseOrders()

export function useSupplierDetail(supplierId: string | null) {
  const [tab, setTab] = useState<SupplierDetailTab>('ledger')
  const id = supplierId ?? ''
  const ledger = useQuery(fetchLedger, id, { enabled: !!supplierId && tab === 'ledger', errorText: 'Không tải được công nợ' })
  const products = useQuery(fetchProducts, id, { enabled: !!supplierId && tab === 'products', errorText: 'Không tải được sản phẩm nhập' })
  const orders = useQuery(fetchOrders, null, { enabled: !!supplierId && tab === 'orders', errorText: 'Không tải được đơn đặt hàng' })

  const supplierOrders = useMemo(
    () => (orders.data ?? []).filter((o) => o.supplierId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders.data, id],
  )

  return {
    tab,
    setTab,
    ledger: ledger.data?.items ?? [],
    ledgerTotal: ledger.data?.total ?? 0,
    orders: supplierOrders,
    products: products.data ?? [],
    loading: { ledger: ledger.loading, orders: orders.loading, products: products.loading },
    reloadLedger: ledger.reload,
  }
}
