import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import type { UnitFormState, UnitFormValues, UnitRecord } from '@/modules/categories/types/categories.types'
import { EMPTY_UNIT_FORM, sameName, unitToForm, validateUnitForm } from '@/modules/categories/utils/categories.utils'

const SUGGESTIONS = ['Cái', 'Chai', 'Lon', 'Hộp', 'Gói', 'Kg', 'Gram', 'Lít', 'Thùng', 'Bịch', 'Vỉ', 'Bộ']

interface UnitFormModalProps {
  state: UnitFormState
  items: UnitRecord[]
  saving: boolean
  nameConflict: string | null
  onClose: () => void
  onSubmit: (values: UnitFormValues) => void
}

export function UnitFormModal({ state, ...props }: UnitFormModalProps) {
  if (!state) return null
  return <UnitFormContent key={state.mode === 'edit' ? state.item.id : 'create'} state={state} {...props} />
}

function UnitFormContent({ state, items, saving, nameConflict, onClose, onSubmit }: UnitFormModalProps & { state: NonNullable<UnitFormState> }) {
  const editing = state.mode === 'edit' ? state.item : undefined
  const [values, setValues] = useState<UnitFormValues>(() => (editing ? unitToForm(editing) : EMPTY_UNIT_FORM))
  const [submitted, setSubmitted] = useState(false)
  const errors = useMemo(() => {
    const client = submitted ? validateUnitForm(values, items, editing?.id) : {}
    if (!client.name && nameConflict && sameName(values.name, nameConflict)) return { ...client, name: 'Đơn vị tính đã tồn tại' }
    return client
  }, [submitted, values, items, editing, nameConflict])
  const taken = new Set(items.map((u) => u.name.toLowerCase()))
  const suggestions = SUGGESTIONS.filter((s) => !taken.has(s.toLowerCase()))
  const renaming = editing && editing.productCount > 0 && values.name.trim() && values.name.trim() !== editing.name

  const submit = () => {
    setSubmitted(true)
    if (Object.keys(validateUnitForm(values, items, editing?.id)).length === 0) onSubmit(values)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? 'Chỉnh sửa đơn vị tính' : 'Thêm đơn vị tính'}
      description={editing ? `Đang dùng cho ${editing.productCount} sản phẩm` : 'Đơn vị dùng khi bán và nhập hàng'}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={submit} loading={saving} className="min-w-28">
            {editing ? 'Lưu thay đổi' : 'Thêm đơn vị'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-4"
      >
        <Field label="Tên đơn vị" required error={errors.name}>
          <input
            autoFocus
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="VD: Hộp"
            maxLength={20}
            className={inputClass(errors.name)}
          />
        </Field>
        {!editing && suggestions.length > 0 && (
          <div className="-mt-1 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValues((v) => ({ ...v, name: s }))}
                className="h-7 cursor-pointer rounded-full border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
        <Field label="Mô tả">
          <input
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="VD: Sữa, bánh đóng hộp"
            maxLength={120}
            className={inputClass()}
          />
        </Field>
        {renaming && (
          <p className="flex gap-2 rounded-lg bg-sky-50 p-3 text-xs text-sky-700">
            <Info className="mt-px size-4 shrink-0" />
            {editing.productCount} sản phẩm đang dùng “{editing.name}” sẽ được đổi sang “{values.name.trim()}”.
          </p>
        )}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}
