import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@/hooks/useQuery'
import { categoryService } from '@/modules/categories/services/category.service'
import { productsService } from '@/modules/products/services/products.service'
import { promotionsService } from '@/modules/promotions/services/promotions.service'
import type { PromotionFilters, PromotionFormValues, PromotionKind, PromotionWithUsage } from '@/modules/promotions/types/promotions.types'
import { DEFAULT_PROMOTION_FILTERS, PROMOTION_PAGE_SIZE } from '@/modules/promotions/utils/promotions.utils'

export type PromotionFormState = { mode: 'create'; kind: PromotionKind } | { mode: 'edit' | 'duplicate'; promotion: PromotionWithUsage } | null
export type PromotionConfirm = { type: 'delete' | 'end'; promotion: PromotionWithUsage } | null

export function usePromotionsPage() {
  const [filters, setFilters] = useState<PromotionFilters>(DEFAULT_PROMOTION_FILTERS)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<PromotionFormState>(null)
  const [saving, setSaving] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<PromotionConfirm>(null)
  const [confirming, setConfirming] = useState(false)
  const keyword = useDebounce(filters.keyword, 250)

  const list = useQuery(promotionsService.list, { ...filters, keyword, page, pageSize: PROMOTION_PAGE_SIZE })
  const summary = useQuery(promotionsService.stats, null)
  const categoryList = useQuery(() => categoryService.list(), null)
  const productList = useQuery(() => productsService.listAll(), null)
  const detail = useQuery(promotionsService.detail, detailId ?? '', { enabled: !!detailId })
  const promotions = list.data?.items ?? []
  const total = list.data?.total ?? 0
  const lastPage = Math.max(1, Math.ceil(total / PROMOTION_PAGE_SIZE))
  useEffect(() => {
    if (!list.loading && list.data && page > lastPage) setPage(lastPage)
  }, [page, lastPage, list.loading, list.data])
  const reload = () => {
    list.reload()
    summary.reload()
    if (detailId) detail.reload()
  }

  const updateFilter = useCallback(<K extends keyof PromotionFilters>(key: K, value: PromotionFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_PROMOTION_FILTERS)
    setPage(1)
  }, [])

  const hasActiveFilters = filters.keyword !== '' || filters.tab !== 'all' || filters.kind !== 'all'

  const submitForm = async (values: PromotionFormValues, activate: boolean) => {
    if (!form) return
    setSaving(true)
    try {
      const saved = await promotionsService.savePromotion(form.mode === 'edit' ? form.promotion.id : null, values, activate)
      reload()
      toast.success(form.mode === 'edit' ? `Đã cập nhật "${saved.name}"` : activate ? `Đã kích hoạt "${saved.name}"` : `Đã lưu nháp "${saved.name}"`)
      setForm(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu khuyến mãi thất bại')
    } finally {
      setSaving(false)
    }
  }

  const changeState = async (p: PromotionWithUsage, state: 'active' | 'paused') => {
    try {
      await promotionsService.setState(p.id, state)
      reload()
      toast.success(state === 'paused' ? `Đã tạm dừng "${p.name}"` : p.state === 'draft' ? `Đã kích hoạt "${p.name}"` : `Đã tiếp tục "${p.name}"`)
    } catch {
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const confirmAction = async () => {
    if (!confirm) return
    setConfirming(true)
    const { type, promotion } = confirm
    try {
      if (type === 'delete') {
        await promotionsService.deletePromotion(promotion.id)
        reload()
        setDetailId(null)
        toast.success(`Đã xóa "${promotion.name}"`)
      } else {
        await promotionsService.setState(promotion.id, 'ended')
        reload()
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
    categories: categoryList.data ?? [],
    products: productList.data ?? [],
    loading: list.loading,
    error: list.error ?? summary.error ?? categoryList.error ?? productList.error ?? (detailId && detail.error),
    reload,
    stats: summary.data ?? { running: 0, scheduled: 0, uses30: 0, discount30: 0, vouchersRunning: 0 },
    statsLoading: summary.loading,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    counts: list.data?.statusCounts ?? { all: 0, running: 0, ended: 0, scheduled: 0, paused: 0, draft: 0 },
    total,
    paged: promotions,
    page,
    setPage,
    form,
    saving,
    openCreate: useCallback((kind: PromotionKind) => setForm({ mode: 'create', kind }), []),
    openEdit: useCallback((promotion: PromotionWithUsage) => setForm({ mode: 'edit', promotion }), []),
    openDuplicate: useCallback((promotion: PromotionWithUsage) => setForm({ mode: 'duplicate', promotion }), []),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    detail: detail.data?.id === detailId ? detail.data : null,
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
