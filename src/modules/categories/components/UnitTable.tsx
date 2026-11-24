import { Pencil, Search, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { CatalogTableShell, RowActionButton, Td } from '@/modules/categories/components/CatalogTableShell'
import type { useUnitManager } from '@/modules/categories/hooks/useUnitManager'
import { formatShortDate } from '@/modules/categories/utils/categories.utils'

type Manager = ReturnType<typeof useUnitManager>

const COLUMNS = [
  { label: 'STT', className: 'w-16 text-center' },
  { label: 'Đơn vị tính' },
  { label: 'Mô tả' },
  { label: 'Số sản phẩm', className: 'text-right w-32' },
  { label: 'Ngày tạo', className: 'w-32' },
  { label: '', className: 'w-24' },
]

export function UnitTable({ manager }: { manager: Manager }) {
  const { filtered, items, loading, keyword, setKeyword, openEdit, requestDelete } = manager

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm đơn vị tính..."
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
      </div>

      <CatalogTableShell
        columns={COLUMNS}
        loading={loading}
        empty={filtered.length === 0}
        emptyTitle={items.length ? 'Không tìm thấy đơn vị tính' : 'Chưa có đơn vị tính'}
        emptyDescription={items.length ? 'Thử tìm với từ khóa khác.' : 'Thêm đơn vị tính như cái, chai, hộp, kg...'}
      >
        {filtered.map((u, index) => (
          <tr key={u.id} onClick={() => openEdit(u)} className="group cursor-pointer transition hover:bg-slate-50/80">
            <Td className="text-center text-xs font-semibold text-slate-400 tabular-nums">{index + 1}</Td>
            <Td>
              <span className="font-semibold text-slate-900 group-hover:text-primary-700">{u.name}</span>
            </Td>
            <Td className="max-w-[360px] truncate text-slate-500">{u.description || '—'}</Td>
            <Td className="text-right">
              <span className={cn('font-semibold', u.productCount ? 'text-slate-800' : 'text-slate-400')}>{formatNumber(u.productCount)}</span>
            </Td>
            <Td className="text-slate-500">{formatShortDate(u.createdAt)}</Td>
            <Td>
              <div className="flex justify-end gap-1">
                <RowActionButton title="Chỉnh sửa" onClick={() => openEdit(u)}>
                  <Pencil className="size-4" />
                </RowActionButton>
                <RowActionButton title="Xóa" danger onClick={() => requestDelete(u)}>
                  <Trash2 className="size-4" />
                </RowActionButton>
              </div>
            </Td>
          </tr>
        ))}
      </CatalogTableShell>
    </>
  )
}
