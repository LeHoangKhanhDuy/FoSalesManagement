import { useState } from 'react'
import { useLoadMore } from '@/hooks/useLoadMore'
import { useQuery } from '@/hooks/useQuery'
import { suppliersService } from '@/modules/suppliers/services/suppliers.service'

export type SupplierDetailTab = 'ledger' | 'payments' | 'products'

const fetchProducts = (id: string) => suppliersService.topProducts(id)

export function useSupplierDetail(supplierId: string | null, version: string) {
  const [tab, setTab] = useState<SupplierDetailTab>('ledger')
  const id = supplierId ?? ''
  const key = `${id}:${version}`
  const ledger = useLoadMore((page) => suppliersService.ledger(id, page), key, { enabled: !!supplierId && tab === 'ledger', errorText: 'Không tải được công nợ' })
  const payments = useLoadMore((page) => suppliersService.payments(id, page), key, { enabled: !!supplierId && tab === 'payments', errorText: 'Không tải được lịch sử thanh toán' })
  const products = useQuery(fetchProducts, id, { enabled: !!supplierId && tab === 'products', errorText: 'Không tải được sản phẩm nhập' })

  return { tab, setTab, ledger, payments, products: { items: products.data ?? [], loading: products.loading, error: products.error } }
}
