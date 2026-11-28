import { useMemo } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { PromotionConfirmModal } from '@/modules/promotions/components/PromotionConfirmModal'
import { PromotionDetailDrawer } from '@/modules/promotions/components/PromotionDetailDrawer'
import { PromotionFilters } from '@/modules/promotions/components/PromotionFilters'
import { PromotionFormDrawer } from '@/modules/promotions/components/PromotionFormDrawer'
import { PromotionStats } from '@/modules/promotions/components/PromotionStats'
import { PromotionTable } from '@/modules/promotions/components/PromotionTable'
import { usePromotionsPage } from '@/modules/promotions/hooks/usePromotionsPage'
import { makeNamers, PROMOTION_PAGE_SIZE } from '@/modules/promotions/utils/promotions.utils'

export default function PromotionsPage() {
  const page = usePromotionsPage()
  const names = useMemo(() => makeNamers(page.categories, page.products), [page.categories, page.products])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý khuyến mãi</h1>
          <p className="text-sm text-slate-500">Quản lý mã giảm giá và theo dõi lượt sử dụng tại quầy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={page.reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={page.loading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button leftIcon={<Plus className="size-4" />} onClick={() => page.openCreate('voucher')}>
            Tạo mã giảm giá
          </Button>
        </div>
      </div>

      {page.error && <p role="alert">{page.error}</p>}
      <PromotionStats stats={page.stats} loading={page.statsLoading} onTab={(t) => page.updateFilter('tab', t)} />

      <Card className="overflow-hidden">
        <PromotionFilters filters={page.filters} counts={page.counts} onChange={page.updateFilter} onReset={page.resetFilters} hasActiveFilters={page.hasActiveFilters} />
        <PromotionTable
          promotions={page.paged}
          names={names}
          loading={page.loading}
          hasActiveFilters={page.hasActiveFilters}
          onView={page.openDetail}
          onEdit={page.openEdit}
          onDuplicate={page.openDuplicate}
          onState={page.changeState}
          onConfirm={page.requestConfirm}
        />
        {!page.loading && page.total > 0 && (
          <Pagination page={page.page} pageSize={PROMOTION_PAGE_SIZE} total={page.total} onPageChange={page.setPage} unit="chương trình" className="border-t border-slate-100 px-4 py-3" />
        )}
      </Card>

      <PromotionFormDrawer state={page.form} promotions={page.promotions} categories={page.categories} products={page.products} saving={page.saving} onClose={page.closeForm} onSubmit={page.submitForm} />
      <PromotionDetailDrawer key={page.detail?.id} promotion={page.detail} names={names} onClose={page.closeDetail} onEdit={page.openEdit} onDuplicate={page.openDuplicate} onState={page.changeState} />
      <PromotionConfirmModal confirm={page.confirm} loading={page.confirming} onClose={page.closeConfirm} onConfirm={page.confirmAction} />
    </div>
  )
}
