import { Boxes, ChartColumn, Plus, RefreshCw, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { CategoryFormModal } from '@/modules/categories/components/CategoryFormModal'
import { CategoryTable } from '@/modules/categories/components/CategoryTable'
import { DeleteCatalogModal } from '@/modules/categories/components/DeleteCatalogModal'
import { UnitFormModal } from '@/modules/categories/components/UnitFormModal'
import { UnitTable } from '@/modules/categories/components/UnitTable'
import { useCategoriesPage } from '@/modules/categories/hooks/useCategoriesPage'
import type { CatalogTab } from '@/modules/categories/types/categories.types'

export default function CategoriesPage() {
  const { tab, setTab, categories, units, openCreate, reload, loading } = useCategoriesPage()

  const tabs: { value: CatalogTab; label: string; icon: LucideIcon; count: number; hint: string }[] = [
    { value: 'categories', label: 'Danh mục sản phẩm', icon: ChartColumn, count: categories.items.length, hint: 'Nhóm hàng hiển thị trên POS' },
    { value: 'units', label: 'Đơn vị tính', icon: Boxes, count: units.items.length, hint: 'Cái, chai, hộp, kg...' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Quản lý Danh mục & Đơn vị</h1>
          <p className="text-sm text-slate-500">Thiết lập nhóm hàng và đơn vị tính dùng chung cho sản phẩm</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={reload} title="Tải lại" aria-label="Tải lại">
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
          </Button>
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>
            {tab === 'categories' ? 'Thêm danh mục' : 'Thêm đơn vị'}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-2 sm:flex sm:gap-1 sm:p-0 sm:px-4">
          {tabs.map(({ value, label, icon: Icon, count, hint }) => {
            const active = tab === value
            return (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  'relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition sm:rounded-none sm:py-3.5',
                  active ? 'bg-primary-50/60 sm:bg-transparent' : 'hover:bg-slate-50',
                )}
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-lg transition',
                    active ? 'bg-primary-600 text-white shadow-primary' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className={cn('flex items-center gap-2 text-sm font-semibold', active ? 'text-primary-700' : 'text-slate-700')}>
                    {label}
                    <span className={cn('rounded-full px-2 text-[11px] leading-5', active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500')}>
                      {count}
                    </span>
                  </span>
                  <span className="hidden text-xs text-slate-400 sm:block">{hint}</span>
                </span>
                {active && <span className="absolute inset-x-2 bottom-0 hidden h-0.5 rounded-full bg-primary-600 sm:block" />}
              </button>
            )
          })}
        </div>

        {tab === 'categories' ? <CategoryTable manager={categories} /> : <UnitTable manager={units} />}
      </Card>

      <CategoryFormModal
        state={categories.form}
        items={categories.items}
        saving={categories.saving}
        onClose={categories.closeForm}
        onSubmit={categories.submit}
      />
      <UnitFormModal state={units.form} items={units.items} saving={units.saving} onClose={units.closeForm} onSubmit={units.submit} />
      <DeleteCatalogModal
        kind="category"
        target={categories.deleteTarget}
        options={categories.items}
        deleting={categories.deleting}
        onClose={categories.closeDelete}
        onConfirm={categories.confirmDelete}
      />
      <DeleteCatalogModal
        kind="unit"
        target={units.deleteTarget}
        options={units.items}
        deleting={units.deleting}
        onClose={units.closeDelete}
        onConfirm={units.confirmDelete}
      />
    </div>
  )
}
