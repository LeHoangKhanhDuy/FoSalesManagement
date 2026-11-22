import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { MOCK_PURCHASE_ORDERS } from '@/modules/purchasing/mocks/purchase-orders.mock'
import { generateCode } from '@/modules/purchasing/utils/purchasing.utils'
import { MOCK_SUPPLIER_PAYMENTS } from '@/modules/suppliers/mocks/payments.mock'
import { MOCK_SUPPLIERS } from '@/modules/suppliers/mocks/suppliers.mock'
import type { PaymentFormValues, Supplier, SupplierFormValues, SupplierPayment, SupplierStatus, SuspendPayload } from '@/modules/suppliers/types/suppliers.types'

const clean = (v: SupplierFormValues): SupplierFormValues => ({
  ...v,
  name: v.name.trim(),
  contact: v.contact.trim(),
  phone: v.phone.replace(/\s/g, ''),
  email: v.email?.trim(),
  address: v.address.trim(),
  taxCode: v.taxCode?.trim(),
  bankName: v.bankName?.trim(),
  bankAccount: v.bankAccount?.replace(/\s/g, ''),
  bankHolder: v.bankHolder?.trim().toUpperCase(),
  note: v.note?.trim(),
  suspendReason: v.status === 'suspended' ? v.suspendReason?.trim() : undefined,
  suspendedUntil: v.status === 'suspended' ? v.suspendedUntil : undefined,
})

const find = (id: string) => {
  const supplier = MOCK_SUPPLIERS.find((s) => s.id === id)
  if (!supplier) throw new Error('Không tìm thấy nhà cung cấp')
  return supplier
}

export const suppliersService = {
  async getSuppliers(): Promise<Supplier[]> {
    if (!USE_MOCK) return http.get<Supplier[]>('/api/suppliers?all=1')
    return sleep(250).then(() => structuredClone(MOCK_SUPPLIERS))
  },

  async getPayments(): Promise<SupplierPayment[]> {
    if (!USE_MOCK) return http.get<SupplierPayment[]>('/api/suppliers/payments')
    return sleep(200).then(() => structuredClone(MOCK_SUPPLIER_PAYMENTS))
  },

  async createSupplier(values: SupplierFormValues): Promise<Supplier> {
    if (!USE_MOCK) return http.post('/api/suppliers', values)
    await sleep(400)
    const supplier: Supplier = { ...clean(values), id: `sup-${crypto.randomUUID().slice(0, 8)}`, createdAt: new Date().toISOString() }
    MOCK_SUPPLIERS.unshift(supplier)
    return structuredClone(supplier)
  },

  async updateSupplier(id: string, values: SupplierFormValues): Promise<Supplier> {
    if (!USE_MOCK) return http.put(`/api/suppliers/${id}`, values)
    await sleep(400)
    const supplier = find(id)
    Object.assign(supplier, clean(values))
    MOCK_PURCHASE_ORDERS.forEach((o) => o.supplierId === id && (o.supplierName = supplier.name))
    return structuredClone(supplier)
  },

  async setStatus(id: string, status: SupplierStatus, suspend?: SuspendPayload): Promise<Supplier> {
    if (!USE_MOCK) return http.patch(`/api/suppliers/${id}/status`, { status, ...suspend })
    await sleep(250)
    const supplier = find(id)
    Object.assign(supplier, { status, suspendReason: status === 'suspended' ? suspend?.reason : undefined, suspendedUntil: status === 'suspended' ? suspend?.until : undefined })
    return structuredClone(supplier)
  },

  async deleteSupplier(id: string): Promise<void> {
    if (!USE_MOCK) return http.delete(`/api/suppliers/${id}`)
    await sleep(350)
    if (MOCK_PURCHASE_ORDERS.some((o) => o.supplierId === id)) throw new Error('Nhà cung cấp đã có giao dịch')
    MOCK_SUPPLIERS.splice(MOCK_SUPPLIERS.findIndex((s) => s.id === id), 1)
  },

  async recordPayment(supplierId: string, values: PaymentFormValues): Promise<SupplierPayment> {
    if (!USE_MOCK) return http.post(`/api/suppliers/${supplierId}/payments`, values)
    await sleep(450)
    const payment: SupplierPayment = {
      id: crypto.randomUUID(),
      code: generateCode('PC'),
      supplierId,
      amount: values.amount,
      method: values.method,
      reference: values.method === 'transfer' ? values.reference.trim() || undefined : undefined,
      note: values.note.trim() || undefined,
      paidAt: new Date().toISOString(),
      paidBy: 'Khánh Duy',
    }
    MOCK_SUPPLIER_PAYMENTS.unshift(payment)
    return structuredClone(payment)
  },
}
