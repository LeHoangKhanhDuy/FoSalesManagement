# Style viết code

Áp dụng cho mọi file trong `src/`. Xem thêm [`CONVENTIONS.md`](./CONVENTIONS.md) và [`UI_PATTERNS.md`](./UI_PATTERNS.md).

## 1. Định dạng

- 2 spaces, **nháy đơn**, **không dấu chấm phẩy**, trailing comma khi xuống dòng.
- Dòng có thể dài (~160–180 ký tự), ưu tiên giữ JSX gọn trên một dòng khi còn đọc được.
- Cấu hình nằm ở `.prettierrc.json` và `.editorconfig`. Nếu dùng Prettier trong editor, để nó đọc file cấu hình này (không dùng cấu hình mặc định nháy kép).

## 2. TypeScript

- `strict` bật toàn bộ. Không dùng `any`; cần ép kiểu thì ép hẹp (`as SupplierTab`).
- `interface` cho object có tên (props, entity); `type` cho union, mapped type, alias.
- Union string thay cho enum: `type PromotionStatus = 'draft' | 'scheduled' | 'running'`.
- Map nhãn/màu theo union bằng `Record`:

```ts
export const SUPPLIER_STATUS: Record<SupplierStatus, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  active: { label: 'Đang hợp tác', tone: 'success' },
  suspended: { label: 'Tạm ngưng', tone: 'warning' },
  inactive: { label: 'Ngừng hợp tác', tone: 'neutral' },
}
```

- Form values tách riêng: `type SupplierFormValues = Omit<Supplier, 'id' | 'createdAt'>`.
- Trạng thái form/drawer dùng discriminated union:

```ts
export type SupplierFormState = { mode: 'create' } | { mode: 'edit'; supplier: Supplier } | null
```

- Tiền là `number` đơn vị đồng, không lưu dạng chuỗi; ngày lưu ISO string (`toISOString()`), ngày sinh `YYYY-MM-DD`.

## 3. Component

- Function component, **named export** (`export function SupplierTable`). Riêng page dùng `export default`.
- Props khai báo `interface Props` (hoặc `<Tên>Props`) ngay trên component.
- Component chỉ render và gọi callback; không gọi service, không giữ logic nghiệp vụ.
- Bọc `memo` cho component nhận list lớn / render lại nhiều (filters, stats, grid).
- Danh sách hằng của component (cột bảng, option) khai báo ngoài component: `const COLUMNS = [...]`.
- Component con nhỏ chỉ dùng trong file thì khai báo trong cùng file (`const Td = ...`, `function Segment<T>`).
- Accessibility: nút chỉ có icon phải có `aria-label`; input có `label` hoặc `placeholder` rõ nghĩa.

### Drawer/Modal có form

Mỗi lần mở phải là form mới và vẫn giữ nội dung khi chạy hiệu ứng đóng:

```tsx
export function SupplierFormDrawer({ state: openState, ...props }: Props) {
  const state = useLastValue(openState)
  const session = useRef({ count: 0, open: false })
  if (openState && !session.current.open) session.current.count += 1
  session.current.open = !!openState
  if (!state) return null
  return <FormContent key={session.current.count} state={state} open={!!openState} {...props} />
}
```

Drawer chi tiết chỉ cần `const item = useLastValue(openItem)` rồi `open={!!openItem}`.

## 4. Hook

- Trả về **object** (không trả tuple, trừ hook nhỏ kiểu `useLocalStorage`).
- Callback truyền xuống component bọc `useCallback`; giá trị dẫn xuất dùng `useMemo`.
- Action bất đồng bộ theo mẫu:

```ts
const submitForm = async (values: SupplierFormValues) => {
  setSaving(true)
  try {
    const saved = await suppliersService.saveSupplier(id, values)
    setSuppliers((list) => list.map((s) => (s.id === saved.id ? saved : s)))
    toast.success(`Đã cập nhật "${saved.name}"`)
    setForm(null)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Lưu thất bại')
  } finally {
    setSaving(false)
  }
}
```

- Đóng drawer/modal không được khi đang lưu: `closeForm: useCallback(() => !saving && setForm(null), [saving])`.
- Không đặt side effect trong updater của `setState` (StrictMode chạy 2 lần). Tính trước, rồi `setState(next)`.

### Form

- Hook `use<Tên>Form(state, ..., onSubmit)` giữ `values`, `submitted`, hàm `validate(values)` trả object lỗi.
- Chỉ hiện lỗi **sau lần bấm lưu đầu tiên**: `const errors = useMemo(() => (submitted ? validate(values) : {}), [submitted, values])`.
- `set(key, value)` dạng generic: `<K extends keyof Values>(key: K, value: Values[K])`.
- Thông báo lỗi ngắn, tiếng Việt, nói rõ cách sửa: "Số điện thoại gồm 10 số, bắt đầu bằng 0".

## 5. Utils & lib

- Hàm thuần, không phụ thuộc React, đặt ở `utils/` của module hoặc `lib/` nếu dùng chung.
- Format luôn qua `@/lib/format`: `formatCurrency` (1.234.000đ), `formatNumber`, `formatCompact` (12.4tr), `formatDateTime`, `removeAccents` (tìm kiếm không dấu).
- Ghép class luôn dùng `cn()` (`clsx` + `tailwind-merge`).
- Mã vạch dùng `@/lib/barcode` (EAN-13 có check digit).

## 6. Tailwind

- Màu chủ đạo dùng token `primary-50..950` (#16A34A), nền xám dùng `slate`.
- Bo góc mặc định `rounded-lg`; thẻ thành viên/hero dùng `rounded-xl`.
- Kích thước icon: `size-4` (mặc định), `size-5` (nút lớn, stat card), `size-3.5` (badge, text nhỏ).
- Chữ: tiêu đề trang `text-[22px] font-bold tracking-tight`, label form `text-xs font-semibold text-slate-700`, chú thích `text-xs text-slate-400`, tiêu đề cột bảng `text-[11px] font-semibold tracking-wider uppercase text-slate-500`.
- Màu ngữ nghĩa: thành công `primary`, cảnh báo `amber`, lỗi/xóa `rose`, thông tin `sky`, đặc biệt `violet`.
- Màu động (theo dữ liệu, VD màu hạng thành viên) dùng `style={{ ... }}` từ object cấu hình (`TIER_STYLE`), không ghép chuỗi class động.
- Animation có sẵn trong `globals.css`: `animate-fade-in`, `animate-scale-in`, `animate-slide-up`, `animate-slide-in-right`, `animate-slide-out-right`, `animate-dash-march`.

## 7. Văn phong trên giao diện

- Tiếng Việt có dấu, ngắn, động từ đầu câu cho nút: "Thêm khách hàng", "Lưu thay đổi", "Xác nhận nhập kho".
- Toast thành công nêu rõ đối tượng: `Đã thêm khách hàng "Trần Thị Mai"`.
- Hành động không thể hoàn tác (xóa, kết thúc sớm) phải có modal xác nhận; dữ liệu đã phát sinh giao dịch thì không cho xóa, gợi ý thao tác thay thế (khóa, ngừng hợp tác, kết thúc).
- Số tiền luôn có hậu tố `đ`, số lượng kèm đơn vị viết thường (`12 lon`).
