import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { CategoryIconTile } from '@/modules/categories/components/CategoryIconTile'
import type { CategoryFormState } from '@/modules/categories/hooks/useCategoryManager'
import type { CategoryFormValues, CategoryRecord } from '@/modules/categories/types/categories.types'
import { categoryToForm, EMPTY_CATEGORY_FORM, validateCategoryForm } from '@/modules/categories/utils/categories.utils'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/modules/categories/utils/category-visuals'

interface CategoryFormModalProps {
  state: CategoryFormState
  items: CategoryRecord[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: CategoryFormValues) => void
}

export function CategoryFormModal({ state, ...props }: CategoryFormModalProps) {
  if (!state) return null
  return <CategoryFormContent key={state.mode === 'edit' ? state.item.id : 'create'} state={state} {...props} />
}

function CategoryFormContent({ state, items, saving, onClose, onSubmit }: CategoryFormModalProps & { state: NonNullable<CategoryFormState> }) {
  const editing = state.mode === 'edit' ? state.item : undefined
  const [values, setValues] = useState<CategoryFormValues>(() => (editing ? categoryToForm(editing) : EMPTY_CATEGORY_FORM))
  const [submitted, setSubmitted] = useState(false)
  const errors = useMemo(() => (submitted ? validateCategoryForm(values, items, editing?.id) : {}), [submitted, values, items, editing])
  const set = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => setValues((v) => ({ ...v, [key]: value }))

  const submit = () => {
    setSubmitted(true)
    if (Object.keys(validateCategoryForm(values, items, editing?.id)).length === 0) onSubmit(values)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
      description={editing ? `${editing.productCount} sản phẩm thuộc danh mục này` : 'Phân loại sản phẩm để bán hàng nhanh hơn'}
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={submit} loading={saving} className="min-w-28">
            {editing ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-5"
      >
        <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
          <CategoryIconTile icon={values.icon} color={values.color} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-slate-900">{values.name.trim() || 'Tên danh mục'}</p>
            <p className="truncate text-xs text-slate-500">{values.description.trim() || 'Mô tả ngắn cho danh mục'}</p>
          </div>
          <span className="flex h-8 shrink-0 items-center gap-2 rounded-full bg-primary-600 px-3.5 text-[13px] font-semibold text-white shadow-primary">
            {values.name.trim() || 'Danh mục'}
            <span className="rounded-full bg-white/20 px-1.5 text-[11px] leading-[18px]">{editing?.productCount ?? 0}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên danh mục" required error={errors.name}>
            <input
              autoFocus
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="VD: Đồ uống"
              maxLength={50}
              className={inputClass(errors.name)}
            />
          </Field>
          <Field label="Mô tả">
            <input
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Không bắt buộc"
              maxLength={120}
              className={inputClass()}
            />
          </Field>
        </div>

        <Field label="Biểu tượng">
          <div className="grid grid-cols-8 gap-1.5">
            {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                title={key}
                onClick={() => set('icon', key)}
                className={cn(
                  'grid aspect-square cursor-pointer place-items-center rounded-lg border transition',
                  values.icon === key
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                    : 'border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-800',
                )}
              >
                <Icon className="size-[18px]" />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Màu sắc">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_COLORS).map(([key, c]) => (
              <button
                key={key}
                type="button"
                title={c.label}
                aria-label={c.label}
                onClick={() => set('color', key)}
                className={cn(
                  'grid size-8 cursor-pointer place-items-center rounded-full text-white ring-offset-2 transition',
                  c.swatch,
                  values.color === key ? 'ring-2 ring-slate-400' : 'hover:scale-110',
                )}
              >
                {values.color === key && <Check className="size-4" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3.5">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Hiển thị trên màn hình bán hàng</p>
            <p className="text-xs text-slate-400">Tắt để ẩn danh mục và các sản phẩm của nó khỏi POS</p>
          </div>
          <Switch checked={values.status === 'active'} onChange={(on) => set('status', on ? 'active' : 'inactive')} label="Hiển thị trên POS" />
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}
