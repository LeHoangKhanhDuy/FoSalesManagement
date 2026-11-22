import { useState } from 'react'
import { ArrowRight, ChevronDown, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { inputClass } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'

interface CatalogItem {
  id: string
  name: string
  productCount: number
}

interface DeleteCatalogModalProps {
  kind: 'category' | 'unit'
  target: CatalogItem | null
  options: CatalogItem[]
  deleting: boolean
  onClose: () => void
  onConfirm: (replacementId?: string) => void
}

export function DeleteCatalogModal({ target, ...props }: DeleteCatalogModalProps) {
  if (!target) return null
  return <DeleteContent key={target.id} target={target} {...props} />
}

function DeleteContent({ kind, target, options, deleting, onClose, onConfirm }: DeleteCatalogModalProps & { target: CatalogItem }) {
  const [replacementId, setReplacementId] = useState<string>()
  const noun = kind === 'category' ? 'danh mục' : 'đơn vị tính'
  const inUse = target.productCount > 0
  const others = options.filter((o) => o.id !== target.id)
  const replacement = others.find((o) => o.id === replacementId)

  return (
    <Modal
      open
      onClose={onClose}
      hideClose
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Hủy
          </Button>
          <Button
            onClick={() => onConfirm(replacementId)}
            disabled={inUse && !replacementId}
            loading={deleting}
            className="bg-rose-600 shadow-none hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300"
          >
            {inUse ? 'Chuyển & xóa' : `Xóa ${noun}`}
          </Button>
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 ring-8 ring-rose-50/50">
          <Trash2 className="size-6 text-rose-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Xóa {noun} “{target.name}”?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {inUse ? (
            <>
              Đang có <span className="font-semibold text-slate-800">{target.productCount} sản phẩm</span> sử dụng. Chọn {noun} thay thế để
              chuyển các sản phẩm này trước khi xóa.
            </>
          ) : (
            `${noun[0].toUpperCase()}${noun.slice(1)} chưa có sản phẩm nào, có thể xóa an toàn.`
          )}
        </p>
      </div>

      {inUse && (
        <div className="mt-5 flex items-center gap-2">
          <span className="flex h-10 min-w-0 flex-1 items-center truncate rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-500 line-through">
            {target.name}
          </span>
          <ArrowRight className="size-4 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <Dropdown
              align="end"
              width={240}
              trigger={
                <button
                  type="button"
                  className={cn(
                    inputClass(),
                    'flex cursor-pointer items-center justify-between font-semibold data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-100',
                    !replacement && 'font-normal text-slate-400',
                  )}
                >
                  <span className="truncate">{replacement?.name ?? `Chọn ${noun}`}</span>
                  <ChevronDown className="size-4 shrink-0 text-slate-400" />
                </button>
              }
            >
              {others.map((o) => (
                <DropdownItem
                  key={o.id}
                  label={o.name}
                  description={`${o.productCount} sản phẩm`}
                  active={o.id === replacementId}
                  onClick={() => setReplacementId(o.id)}
                />
              ))}
            </Dropdown>
          </div>
        </div>
      )}
    </Modal>
  )
}
