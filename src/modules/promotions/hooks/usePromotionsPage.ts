import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { catalogService } from '@/modules/categories/services/catalog.service'
import { productsService } from '@/modules/products/services/products.service'
import { promotionsService } from '@/modules/promotions/services/promotions.service'
import type { PromotionFilters, PromotionFormValues, PromotionKind, PromotionTab, PromotionWithUsage } from '@/modules/promotions/types/promotions.types'
import {
  DEFAULT_PROMOTION_FILTERS,
  filterPromotions,
  getPromotionStatus,
  PROMOTION_PAGE_SIZE,
  PROMOTION_TABS,
  sortPromotions,
} from '@/modules/promotions/utils/promotions.utils'
import type { Category, Product } from '@/modules/sales/types/sales.types'

export type PromotionFormState = { mode: 'create'; kind: PromotionKind } | { mode: 'edit' | 'duplicate'; promotion: PromotionWithUsage } | null
export type PromotionConfirm = { type: 'delete' | 'end'; promotion: PromotionWithUsage } | null

export function usePromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionWithUsage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PromotionFilters>(DEFAULT_PROMOTION_FILTERS)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<PromotionFormState>(null)
  const [saving, setSaving] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<PromotionConfirm>(null)
  const [confirming, setConfirming] = useState(false)
  const keyword = useDebounce(filters.keyword, 250)

  const reload = useCallback(() => {
    setLoading(true)
    Promise.all([promotionsService.getPromotions(), catalogService.getCategories(), productsService.getProducts()])
      .then(([p, c, pr]) => {
        setPromotions(p)
        setCategories(c)
        setProducts(pr)
      })
      .catch(() => toast.error('Không tải được danh sách khuyến mãi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const updateFilter = useCallback(<K extends keyof PromotionFilters>(key: K, value: PromotionFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_PROMOTION_FILTERS)
    setPage(1)
  }, [])

  const counts = useMemo(() => {
    const base = filterPromotions(promotions, { ...filters, tab: 'all' }, keyword)
    return Object.fromEntries(PROMOTION_TABS.map((t) => [t.value, t.value === 'all' ? base.length : base.filter((p) => getPromotionStatus(p, p.usage.count) === t.value).length])) as Record<PromotionTab, number>
  }, [promotions, filters, keyword])

  const filtered = useMemo(() => sortPromotions(filterPromotions(promotions, filters, keyword), filters.sort), [promotions, filters, keyword])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PROMOTION_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PROMOTION_PAGE_SIZE, currentPage * PROMOTION_PAGE_SIZE), [filtered, currentPage])
  const hasActiveFilters = filters.keyword !== '' || filters.tab !== 'all' || filters.kind !== 'all'

  const stats = useMemo(() => {
    const status = promotions.map((p) => getPromotionStatus(p, p.usage.count))
    return {
      running: status.filter((s) => s === 'running').length,
      scheduled: status.filter((s) => s === 'scheduled').length,
      uses30: promotions.reduce((s, p) => s + p.usage.last30Count, 0),
      discount30: promotions.reduce((s, p) => s + p.usage.last30Discount, 0),
      vouchersRunning: promotions.filter((p, i) => p.kind === 'voucher' && status[i] === 'running').length,
    }
  }, [promotions])

  const upsert = (p: PromotionWithUsage) => setPromotions((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]))

  const submitForm = async (values: PromotionFormValues, activate: boolean) => {
    if (!form) return
    setSaving(true)
    try {
      const saved = await promotionsService.savePromotion(form.mode === 'edit' ? form.promotion.id : null, values, activate)
      upsert(saved)
      toast.success(form.mode === 'edit' ? `Đã cập nhật "${saved.name}"` : activate ? `Đã kích hoạt "${saved.name}"` : `Đã lưu nháp "${saved.name}"`)
      setForm(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu khuyến mãi thất bại')
    } finally {
      setSaving(false)
    }
  }

  const changeState = useCallback(async (p: PromotionWithUsage, state: 'active' | 'paused') => {
    try {
      upsert(await promotionsService.setState(p.id, state))
      toast.success(state === 'paused' ? `Đã tạm dừng "${p.name}"` : p.state === 'draft' ? `Đã kích hoạt "${p.name}"` : `Đã tiếp tục "${p.name}"`)
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }, [])

  const confirmAction = async () => {
    if (!confirm) return
    setConfirming(true)
    const { type, promotion } = confirm
    try {
      if (type === 'delete') {
        await promotionsService.deletePromotion(promotion.id)
        setPromotions((list) => list.filter((x) => x.id !== promotion.id))
        setDetailId(null)
        toast.success(`Đã xóa "${promotion.name}"`)
      } else {
        upsert(await promotionsService.setState(promotion.id, 'ended'))
        toast.success(`Đã kết thúc "${promotion.name}"`)
      }
      setConfirm(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thao tác thất bại')
    } finally {
      setConfirming(false)
    }
  }

  return {
    promotions,
    categories,
    products,
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
    openCreate: useCallback((kind: PromotionKind) => setForm({ mode: 'create', kind }), []),
    openEdit: useCallback((promotion: PromotionWithUsage) => setForm({ mode: 'edit', promotion }), []),
    openDuplicate: useCallback((promotion: PromotionWithUsage) => setForm({ mode: 'duplicate', promotion }), []),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    detail: useMemo(() => promotions.find((p) => p.id === detailId) ?? null, [promotions, detailId]),
    openDetail: useCallback((p: PromotionWithUsage) => setDetailId(p.id), []),
    closeDetail: useCallback(() => setDetailId(null), []),
    changeState,
    confirm,
    confirming,
    requestConfirm: useCallback((type: 'delete' | 'end', promotion: PromotionWithUsage) => setConfirm({ type, promotion }), []),
    closeConfirm: useCallback(() => !confirming && setConfirm(null), [confirming]),
    confirmAction,
  }
}
