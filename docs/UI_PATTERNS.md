# UI patterns & design system

Phong cách: sạch, nhiều khoảng trắng, nền `slate-50`, khối trắng không viền/không bóng, màu nhấn xanh `#16A34A`.

## 1. Màu

| Vai trò | Token | Dùng cho |
|---------|-------|----------|
| Chủ đạo | `primary-600` (#16A34A), `primary-50/100/700` | Nút chính, tab active, số tiền khách trả, trạng thái tốt |
| Nền trang | `slate-50` | `MainLayout` |
| Chữ | `slate-900` (tiêu đề), `slate-800/700` (nội dung), `slate-500/400` (phụ) | |
| Cảnh báo | `amber` | Sắp hết hàng, còn nợ, tạm ngưng |
| Lỗi / nguy hiểm | `rose` | Hết hàng, quá hạn, xóa, giảm giá |
| Thông tin | `sky` | Chờ giao, sắp diễn ra |
| Đặc biệt | `violet` | Quà tặng, nháp, kiểm đếm |

Shadow có sẵn: `shadow-soft`, `shadow-card`, `shadow-primary` (nút chính).

`Badge` có các tone: `primary`, `success`, `warning`, `danger`, `info`, `neutral`, `violet`, dùng kèm `dot` cho trạng thái.

Màu hạng thành viên khai báo ở `TIER_STYLE` (`modules/customers/utils/customers.utils.ts`).

## 2. UI kit (`src/components/ui`)

| Component | Khi nào dùng |
|-----------|--------------|
| `Button` | variant `primary` (mặc định), `outline`, `ghost`, `soft`, `danger`, `secondary`; size `sm/md/lg/icon/icon-sm`; có `leftIcon`, `rightIcon`, `loading` |
| `Input` | Ô tìm kiếm có `leftIcon`, `rightSlot` |
| `FormField` | `Field` (label + lỗi), `inputClass(error)`, `NumberInput` (định dạng nghìn, `suffix`), `FormSection` (tiêu đề nhóm) |
| `Dropdown` | Menu thao tác (`DropdownItem`, `DropdownSeparator`); `FilterDropdown` cho bộ lọc (hỗ trợ `icon`, `count`) |
| `DatePicker` | Chọn ngày (min/max, `disablePast`, `disableFuture`, `align`, `side`) |
| `Drawer` | Form lớn, xem chi tiết (trượt từ phải, có hiệu ứng đóng) |
| `Modal` | Xác nhận, form nhỏ (≤ 5 trường) |
| `Badge`, `Avatar`, `Card`, `EmptyState`, `Pagination`, `Switch`, `Checkbox`, `Kbd`, `ImageDropzone` | |

Component dùng chung ngoài kit: `Logo`, `ProductCode` (hiển thị `SKU · ▥ barcode · thông tin thêm` – **mọi chỗ hiển thị sản phẩm phải có barcode**).

## 3. Bố cục trang danh sách (chuẩn)

```
┌ Tiêu đề trang + mô tả ─────────────── [⟳] [Xuất Excel] [+ Thêm ...] ┐
├ 4 thẻ thống kê (grid 2 → 4 cột, thẻ nào lọc được thì bấm được)       ┤
└ Card
   ├ (tab chuyển chế độ xem nếu có, VD "Danh sách" | "Cấu hình")
   ├ Toolbar: [🔍 Tìm kiếm ............] [Lọc trạng thái ▾] [Lọc khác ▾] [Sắp xếp ▾] [Đặt lại]
   ├ Bảng
   └ Pagination
Drawer form · Drawer chi tiết · Modal xác nhận
```

Khung code:

```tsx
export default function SuppliersPage() {
  const page = useSuppliersPage()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Nhà cung cấp</h1>
          <p className="text-sm text-slate-500">Mô tả ngắn chức năng trang</p>
        </div>
        <div className="flex items-center gap-2">{/* nút hành động */}</div>
      </div>
      <SupplierStats ... />
      <Card className="overflow-hidden">
        <SupplierFilters ... />
        <SupplierTable ... />
        <Pagination ... className="border-t border-slate-100 px-4 py-3" />
      </Card>
      <SupplierFormDrawer ... />
      <SupplierDetailDrawer ... />
    </div>
  )
}
```

### Thẻ thống kê

`rounded-lg bg-white p-4`, icon trong ô `size-12 rounded-lg` nền nhạt cùng tông (`bg-amber-50 text-amber-600`), nhãn `text-xs`, số `text-xl font-bold`, gợi ý `text-[11px] text-slate-400`. Thẻ có `action` thì hover `ring-2 ring-primary-100`. Khi loading hiện 4 khối `animate-pulse`.

### Toolbar lọc

- Ô tìm kiếm luôn đứng đầu, `flex-1 min-w-[260px]`, có nút xóa (X) khi có chữ.
- Lọc trạng thái/cấp độ/hạng: **`FilterDropdown` ngay sau ô tìm kiếm**, option có `count`, nút đổi màu khi đang lọc và hiện `Nhãn (số)`.
- Nút "Đặt lại" chỉ hiện khi có bộ lọc.
- Tìm kiếm áp dụng `useDebounce(250ms)` và `removeAccents` (gõ không dấu vẫn ra).

### Bảng

- Header `bg-slate-50`, chữ `text-[11px] font-semibold uppercase tracking-wider text-slate-500`; dòng `divide-y divide-slate-100`, hover `bg-slate-50/80`, cả dòng bấm được để mở chi tiết.
- Cột tiền canh phải, đậm. Cột đầu: icon/avatar + tên đậm + dòng phụ `text-xs text-slate-400`.
- Cột cuối: nút hành động chính (nếu có) + menu `…` (`aria-label="Thao tác khác"`), bọc `onClick={(e) => e.stopPropagation()}`.
- Loading: 6 dòng skeleton; rỗng: `EmptyState` (nội dung khác nhau khi đang lọc / chưa có dữ liệu).
- Bảng rộng: bọc `overflow-x-auto`, `min-w-[1040px]` trở lên.

### Drawer form

- `className="max-w-[560px..780px]"`, `title`, `description`, `footer` gồm `Hủy` (outline, trái) và nút chính (phải, có `loading`).
- Nội dung chia `FormSection`, lưới `grid grid-cols-2|3 gap-3`.
- Lựa chọn ít giá trị dùng nhóm nút (segmented/chip) thay cho select.

### Drawer chi tiết

Header (avatar/icon + tên + mã + Badge trạng thái) → cảnh báo (nếu có) → 4 ô số liệu `rounded-lg bg-slate-50 p-3` → khối thông tin → tab con dạng segmented (`bg-slate-100 p-1`, tab active `bg-white shadow-sm`) → danh sách. Footer: hành động phụ (trái), hành động chính (phải).

### Modal xác nhận nguy hiểm

Icon tròn `bg-rose-50` ở giữa, tiêu đề, tên đối tượng, hộp giải thích `bg-amber-50 text-amber-700`. Nút xác nhận `bg-rose-600`. Nếu không được phép (đã có giao dịch) thì đổi nội dung và đưa ra thao tác thay thế.

## 4. Trạng thái & phản hồi

- Mọi action ghi dữ liệu: `toast.success` / `toast.error` (sonner).
- Nút đang xử lý: `loading` + `disabled`; không cho đóng drawer/modal khi đang lưu.
- Hiệu ứng: drawer `slide-in-right/out-right`, dropdown `slide-up`, xuất hiện mới `scale-in`, đổi màn `fade-in`.

## 5. Phím tắt & máy quét

- POS: `F2` tìm sản phẩm, `F4` hóa đơn mới, `F9` thanh toán, `Ctrl K` tìm kiếm chung.
- Máy quét mã vạch dùng `useBarcodeScanner` (nhận chuỗi gõ nhanh + Enter, không cần focus ô nhập), có ở POS, Sản phẩm, Tồn kho, Nhận hàng.
