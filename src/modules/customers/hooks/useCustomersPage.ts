import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { formatNumber } from '@/lib/format'
import { customersService } from '@/modules/customers/services/customers.service'
import type { AdjustPointsPayload, CustomerFilters, CustomerFormValues, CustomerWithStats, MembershipSettings } from '@/modules/customers/types/customers.types'
import { CUSTOMER_PAGE_SIZE, DEFAULT_CUSTOMER_FILTERS, exportCustomersCsv } from '@/modules/customers/utils/customers.utils'

export type CustomerPageTab = 'customers' | 'membership'
export type CustomerFormState = { mode: 'create' } | { mode: 'edit'; customer: CustomerWithStats } | null

export function useCustomersPage() {
  const [view, setView] = useState<CustomerPageTab>('customers')
  const [filters, setFilters] = useState<CustomerFilters>(DEFAULT_CUSTOMER_FILTERS)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<CustomerFormState>(null)
  const [saving, setSaving] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [pointsId, setPointsId] = useState<string | null>(null)
  const [adjusting, setAdjusting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CustomerWithStats | null>(null)
  const [deleting, setDeleting] = useState(false)
  const keyword = useDebounce(filters.keyword, 250)

  const params = { ...filters, keyword, page, pageSize: CUSTOMER_PAGE_SIZE }
  const list = useQuery(customersService.list, view === 'membership' ? { ...DEFAULT_CUSTOMER_FILTERS, page: 1, pageSize: 1 } : params)
  const summary = useQuery(customersService.stats, null)
  const membership = useQuery(customersService.getMembership, null)
  const settings = membership.data
  const customers = list.data?.items ?? []
  const total = list.data?.total ?? 0
  const counts = list.data?.tierCounts ?? { all: 0, retail: 0, silver: 0, gold: 0, diamond: 0 }
  const stats = summary.data ?? { total: 0, active30: 0, returning: 0, new30: 0, points: 0, birthday: 0 }
  const detailQuery = useQuery(customersService.detail, detailId ?? '', { enabled: !!detailId })
  const attempt = useRef({ signature: '', key: '' })
  const reload = () => {
    list.reload()
    summary.reload()
    membership.reload()
    if (detailId) detailQuery.reload()
  }
  useEffect(() => {
    const last = Math.max(1, Math.ceil(total / CUSTOMER_PAGE_SIZE))
    if (view === 'customers' && list.data && !list.loading && page > last) setPage(last)
  }, [view, page, total, list.data, list.loading])

  const updateFilter = useCallback(<K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_CUSTOMER_FILTERS)
    setPage(1)
  }, [])

  const hasActiveFilters = filters.keyword !== '' || filters.tab !== 'all' || filters.segment !== 'all'

  const submitForm = async (values: CustomerFormValues) => {
    if (!form) return
    setSaving(true)
    try {
      const saved = await customersService.saveCustomer(form.mode === 'edit' ? form.customer.id : null, values)
      reload()
      toast.success(form.mode === 'edit' ? `Đã cập nhật "${saved.name}"` : `Đã thêm khách hàng "${saved.name}"`)
      setForm(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu khách hàng thất bại')
    } finally {
      setSaving(false)
    }
  }

  const toggleBlock = async (c: CustomerWithStats) => {
    const status = c.status === 'blocked' ? 'active' : 'blocked'
    try {
      await customersService.setStatus(c.id, status)
      reload()
      toast.success(status === 'blocked' ? `Đã khóa ${c.name}` : `Đã mở khóa ${c.name}`)
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const submitPoints = async (payload: AdjustPointsPayload) => {
    if (!pointsId) return
    setAdjusting(true)
    try {
      const signature = JSON.stringify([pointsId, payload])
      if (attempt.current.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() }
      const { customer } = await customersService.adjustPoints(pointsId, payload, attempt.current.key)
      attempt.current.signature = ''
      reload()
      toast.success(`${payload.points > 0 ? 'Cộng' : 'Trừ'} ${formatNumber(Math.abs(payload.points))} điểm cho ${customer.name}`)
      setPointsId(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Điều chỉnh điểm thất bại')
    } finally {
      setAdjusting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await customersService.deleteCustomer(deleteTarget.id)
      reload()
      setDetailId(null)
      toast.success(`Đã xóa "${deleteTarget.name}"`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const saveSettings = async (next: MembershipSettings) => {
    await customersService.saveMembership(next)
    reload()
  }

  const exportCsv = async () => {
    if (!settings || !total) return toast.info('Không có khách hàng để xuất')
    try {
      const rows: CustomerWithStats[] = []
      for (let index = 1; ; index++) {
        const batch = await customersService.list({ ...params, page: index, pageSize: 100 })
        rows.push(...batch.items)
        if (!batch.items.length || rows.length >= batch.total) break
      }
      exportCustomersCsv(rows, settings)
    } catch { toast.error('Xuất danh sách thất bại') }
  }

  return {
    view,
    setView,
    customers,
    settings,
    loading: list.loading,
    error: list.error ?? summary.error ?? membership.error ?? (detailId ? detailQuery.error : undefined),
    reload,
    stats,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    counts,
    total,
    paged: customers,
    page,
    setPage,
    form,
    saving,
    openCreate: useCallback(() => setForm({ mode: 'create' }), []),
    openEdit: useCallback((customer: CustomerWithStats) => setForm({ mode: 'edit', customer }), []),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    detail: detailQuery.data?.id === detailId ? detailQuery.data : null,
    openDetail: useCallback((c: CustomerWithStats) => setDetailId(c.id), []),
    closeDetail: useCallback(() => setDetailId(null), []),
    pointsTarget: useMemo(() => customers.find((c) => c.id === pointsId) ?? null, [customers, pointsId]),
    adjusting,
    openPoints: useCallback((c: CustomerWithStats) => setPointsId(c.id), []),
    closePoints: useCallback(() => !adjusting && setPointsId(null), [adjusting]),
    submitPoints,
    toggleBlock,
    deleteTarget,
    deleting,
    requestDelete: useCallback((c: CustomerWithStats) => setDeleteTarget(c), []),
    closeDelete: useCallback(() => !deleting && setDeleteTarget(null), [deleting]),
    confirmDelete,
    saveSettings,
    exportCsv,
  }
}
