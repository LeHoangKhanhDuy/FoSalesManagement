import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/FormField'
import { useStoreSettings } from '@/modules/stores/hooks/useStoreSettings'

export default function StoreSettingsPage() {
  const { store, error, reload, canEdit, canEditCode, saving, revision, submit } = useStoreSettings()
  if (error) return <div role="alert">{error} <Button variant="outline" onClick={reload}>Thử lại</Button></div>
  if (!store) return <p role="status">Đang tải thông tin cửa hàng…</p>
  return (
    <section className="max-w-3xl">
      <h1 className="mb-4 text-[22px] font-bold text-slate-900">Cài đặt cửa hàng</h1>
      <form key={revision} onSubmit={submit} className="rounded-xl bg-white p-5">
        <fieldset disabled={!canEditCode || saving} className="grid gap-4 sm:grid-cols-2">
          <Field label="Mã cửa hàng" required><input className={inputClass()} name="code" defaultValue={store.code} required /></Field>
          <fieldset disabled={!canEdit} className="contents">
            <Field label="Tên cửa hàng" required><input className={inputClass()} name="name" defaultValue={store.name} required minLength={2} maxLength={150} /></Field>
            {([
              ['branchName', 'Tên chi nhánh', 100], ['address', 'Địa chỉ', 255],
              ['phone', 'Số điện thoại', 24], ['taxCode', 'Mã số thuế', 24],
            ] as const).map(([key, label, max]) => (
              <Field key={key} label={label}><input className={inputClass()} name={key} defaultValue={store[key] ?? ''} maxLength={max} /></Field>
            ))}
            <Field label="Lời nhắn cuối hóa đơn" className="sm:col-span-2"><input className={inputClass()} name="receiptFooter" defaultValue={store.receiptFooter ?? ''} maxLength={255} /></Field>
            <Field label="Số ngày cho phép trả hàng"><input className={inputClass()} type="number" name="returnDays" defaultValue={store.returnDays} min={0} max={365} step={1} required /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary-600" name="allowNegativeStock" defaultChecked={store.allowNegativeStock} />Cho phép bán âm kho</label>
          </fieldset>
        </fieldset>
        {canEditCode && <Button className="mt-5" type="submit" loading={saving}>Lưu thay đổi</Button>}
      </form>
    </section>
  )
}
