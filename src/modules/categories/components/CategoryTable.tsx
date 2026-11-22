import { ChevronDown, ChevronUp, Eye, Pencil, Search, Trash2, X } from 'lucide-react'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { CatalogTableShell, RowActionButton, Td } from '@/modules/categories/components/CatalogTableShell'
import { CategoryIconTile } from '@/modules/categories/components/CategoryIconTile'
import type { useCategoryManager } from '@/modules/categories/hooks/useCategoryManager'
import { CATEGORY_STATUS_OPTIONS, formatShortDate } from '@/modules/categories/utils/categories.utils'

type Manager = ReturnType<typeof useCategoryManager>

const COLUMNS = [
  { label: 'Thứ tự', className: 'w-20' },
  { label: 'Danh mục' },
  { label: 'Sản phẩm đang áp dụng', className: 'text-right w-32' },
  { label: 'Hiển thị', className: 'text-center w-32' },
  { label: 'Ngày tạo', className: 'w-32' },
  { label: '', className: 'w-24' },
]

export function CategoryTable({ manager }: { manager: Manager }) {
  const { filtered, items, loading, keyword, setKeyword, status, setStatus, canReorder, move, toggleStatus, openEdit, requestDelete } =
    manager
  const statusLabel = status === 'all' ? 'Trạng thái' : (CATEGORY_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? '')

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm tên hoặc mô tả danh mục..."
          leftIcon={<Search />}
          wrapperClassName="min-w-[260px] flex-1"
          rightSlot={
            keyword && (
              <button onClick={() => setKeyword('')} className="cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa tìm kiếm">
                <X className="size-4" />
              </button>
            )
          }
        />
        <FilterDropdown
          icon={Eye}
          label={statusLabel}
          title="Trạng thái"
          value={status}
          options={CATEGORY_STATUS_OPTIONS}
          onChange={setStatus}
          active={status !== 'all'}
        />
      </div>

      <CatalogTableShell
        columns={COLUMNS}
        loading={loading}
        empty={filtered.length === 0}
        emptyTitle={items.length ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
        emptyDescription={items.length ? 'Thử đổi từ khóa hoặc bộ lọc trạng thái.' : 'Thêm danh mục để phân loại sản phẩm trên màn hình bán hàng.'}
      >
        {filtered.map((c) => {
          const index = items.findIndex((x) => x.id === c.id)
          const hidden = c.status === 'inactive'
          return (
            <tr key={c.id} onClick={() => openEdit(c)} className="group cursor-pointer transition hover:bg-slate-50/80">
              <Td>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <span className="w-5 text-center text-xs font-semibold text-slate-400">{index + 1}</span>
                  <div className="flex flex-col">
                    {[
                      { dir: -1 as const, icon: ChevronUp, disabled: index === 0, label: 'Lên trên' },
                      { dir: 1 as const, icon: ChevronDown, disabled: index === items.length - 1, label: 'Xuống dưới' },
                    ].map(({ dir, icon: Icon, disabled, label }) => (
                      <button
                        key={dir}
                        type="button"
                        title={canReorder ? label : 'Xóa tìm kiếm/bộ lọc để sắp xếp'}
                        disabled={!canReorder || disabled}
                        onClick={() => move(c.id, dir)}
                        className="grid h-4 w-6 cursor-pointer place-items-center rounded text-slate-400 transition hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Icon className="size-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </Td>
              <Td>
                <div className={cn('flex items-center gap-3', hidden && 'opacity-60')}>
                  <CategoryIconTile icon={c.icon} color={c.color} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-primary-700">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.description || 'Chưa có mô tả'}</p>
                  </div>
                </div>
              </Td>
              <Td className="text-right">
                <span className={cn('font-semibold', c.productCount ? 'text-slate-800' : 'text-slate-400')}>{formatNumber(c.productCount)}</span>
              </Td>
              <Td className="text-center">
                <Switch size="sm" checked={!hidden} onChange={() => toggleStatus(c)} label={hidden ? 'Hiển thị' : 'Ẩn'} />
              </Td>
              <Td className="text-slate-500">{formatShortDate(c.createdAt)}</Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <RowActionButton title="Chỉnh sửa" onClick={() => openEdit(c)}>
                    <Pencil className="size-4" />
                  </RowActionButton>
                  <RowActionButton title="Xóa" danger onClick={() => requestDelete(c)}>
                    <Trash2 className="size-4" />
                  </RowActionButton>
                </div>
              </Td>
            </tr>
          )
        })}
      </CatalogTableShell>
    </>
  )
}
