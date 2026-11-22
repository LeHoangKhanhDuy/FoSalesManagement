import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { formatNumber } from '@/lib/format'
import { customersService } from '@/modules/customers/services/customers.service'
import type { AdjustPointsPayload, CustomerFilters, CustomerFormValues, CustomerTab, CustomerWithStats, MembershipSettings } from '@/modules/customers/types/customers.types'
import { CUSTOMER_PAGE_SIZE, DEFAULT_CUSTOMER_FILTERS, exportCustomersCsv, isBirthdayMonth, matchKeyword, matchSegment, sortCustomers, TIER_ORDER } from '@/modules/customers/utils/customers.utils'

export type CustomerPageTab = 'customers' | 'membership'
export type CustomerFormState = { mode: 'create' } | { mode: 'edit'; customer: CustomerWithStats } | null

export function useCustomersPage() {
  const [view, setView] = useState<CustomerPageTab>('customers')
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [settings, setSettings] = useState<MembershipSettings | null>(null)
  const [loading, setLoading] = useState(true)
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

  const reload = useCallback(() => {
    setLoading(true)
    Promise.all([customersService.getCustomers(), customersService.getMembership()])
      .then(([c, s]) => {
        setCustomers(c)
        setSettings(s)
      })
      .catch(() => toast.error('Không tải được danh sách khách hàng'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const updateFilter = useCallback(<K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_CUSTOMER_FILTERS)
    setPage(1)
  }, [])

  const searched = useMemo(() => customers.filter((c) => matchKeyword(c, keyword) && matchSegment(c, filters.segment)), [customers, keyword, filters.segment])
  const counts = useMemo(
    () => Object.fromEntries((['all', ...TIER_ORDER] as CustomerTab[]).map((t) => [t, t === 'all' ? searched.length : searched.filter((c) => c.tier === t).length])) as Record<CustomerTab, number>,
    [searched],
  )
  const filtered = useMemo(() => sortCustomers(filters.tab === 'all' ? searched : searched.filter((c) => c.tier === filters.tab), filters.sort), [searched, filters.tab, filters.sort])
  const totalPages = Math.max(1, Math.ceil(filtered.length / CUSTOMER_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filtered.slice((currentPage - 1) * CUSTOMER_PAGE_SIZE, currentPage * CUSTOMER_PAGE_SIZE), [filtered, currentPage])
  const hasActiveFilters = filters.keyword !== '' || filters.tab !== 'all' || filters.segment !== 'all'

  const stats = useMemo(() => {
    const now = Date.now()
    return {
      total: customers.length,
      new30: customers.filter((c) => now - new Date(c.createdAt).getTime() <= 30 * 86_400_000).length,
      returning: customers.filter((c) => c.stats.orders30 >= 2).length,
      active30: customers.filter((c) => c.stats.orders30 >= 1).length,
      points: customers.reduce((s, c) => s + c.points, 0),
      birthday: customers.filter((c) => c.status === 'active' && isBirthdayMonth(c)).length,
    }
  }, [customers])

  const upsert = (c: CustomerWithStats) => setCustomers((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [c, ...list]))

  const submitForm = async (values: CustomerFormValues) => {
    if (!form) return
    setSaving(true)
    try {
      const saved = await customersService.saveCustomer(form.mode === 'edit' ? form.customer.id : null, values)
      upsert(saved)
      toast.success(form.mode === 'edit' ? `Đã cập nhật "${saved.name}"` : `Đã thêm khách hàng "${saved.name}"`)
      setForm(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu khách hàng thất bại')
    } finally {
      setSaving(false)
    }
  }

  const toggleBlock = useCallback(async (c: CustomerWithStats) => {
    const status = c.status === 'blocked' ? 'active' : 'blocked'
    try {
      upsert(await customersService.setStatus(c.id, status))
      toast.success(status === 'blocked' ? `Đã khóa ${c.name}` : `Đã mở khóa ${c.name}`)
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }, [])

  const submitPoints = async (payload: AdjustPointsPayload) => {
    if (!pointsId) return
    setAdjusting(true)
    try {
      const { customer } = await customersService.adjustPoints(pointsId, payload)
      upsert(customer)
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
      setCustomers((list) => list.filter((c) => c.id !== deleteTarget.id))
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
    const list = await customersService.saveMembership(next)
    setSettings(structuredClone(next))
    setCustomers(list)
  }

  const exportCsv = () => {
    if (!settings || !filtered.length) return toast.info('Không có khách hàng để xuất')
    exportCustomersCsv(filtered, settings)
    toast.success(`Đã xuất ${filtered.length} khách hàng`)
  }

  return {
    view,
    setView,
    customers,
    settings,
    loading,
    reload,
    stats,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    counts,
    filtered,
    paged,
    page: currentPage,
    setPage,
    form,
    saving,
    openCreate: useCallback(() => setForm({ mode: 'create' }), []),
    openEdit: useCallback((customer: CustomerWithStats) => setForm({ mode: 'edit', customer }), []),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    detail: useMemo(() => customers.find((c) => c.id === detailId) ?? null, [customers, detailId]),
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
