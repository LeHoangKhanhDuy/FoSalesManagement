import { Switch } from '@/components/ui/Switch'
import type { SetProductField } from '@/modules/products/hooks/useProductForm'
import type { ProductFormValues } from '@/modules/products/types/products.types'

interface ProductOptionFieldsProps {
  values: ProductFormValues
  set: SetProductField
}

function OptionRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 p-3.5">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

export function ProductOptionFields({ values, set }: ProductOptionFieldsProps) {
  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
      <OptionRow
        title="Đang bán"
        description="Tắt để ẩn sản phẩm khỏi màn hình bán hàng"
        checked={values.status === 'active'}
        onChange={(on) => set('status', on ? 'active' : 'inactive')}
      />
      <OptionRow
        title="Sản phẩm bán chạy"
        description="Hiện nhãn “Bán chạy” trên màn hình bán hàng"
        checked={values.isBestSeller}
        onChange={(on) => set('isBestSeller', on)}
      />
    </div>
  )
}
