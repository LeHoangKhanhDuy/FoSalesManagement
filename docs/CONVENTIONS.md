# Quy ước dự án FoSales FE

Tài liệu này mô tả **cách tổ chức code** của dự án. Đọc cùng [`CODE_STYLE.md`](./CODE_STYLE.md) (cách viết) và [`UI_PATTERNS.md`](./UI_PATTERNS.md) (giao diện).

## 1. Nguyên tắc bắt buộc

| # | Quy tắc | Ví dụ |
|---|---------|-------|
| 1 | **Không viết comment** trong `src/` (trừ `/// <reference types="vite/client" />`) | Đặt tên biến/hàm đủ rõ để không cần comment |
| 2 | **Không dùng file `index.ts` (barrel)** | Import thẳng tới file |
| 3 | **Luôn import bằng alias `@/`**, không dùng `./` hay `../` | `import { Button } from '@/components/ui/Button'` |
| 4 | **Page chỉ chứa UI**, toàn bộ state & logic nằm trong hook | `ProductsPage.tsx` gọi `useProductsPage()` |
| 5 | **File ngắn** (~ dưới 200 dòng). Dài thì tách component / hook / utils | `ProductFormDrawer` → `ProductBasicFields`, `ProductPricingFields`... |
| 6 | Bộ component cùng họ gom **trong 1 file** | `Dropdown.tsx` chứa `Dropdown`, `DropdownItem`, `FilterDropdown` |
| 7 | **Không thêm thư viện UI** (Radix, MUI, date-fns, chart lib...). Tự viết trong `components/ui` | `DatePicker`, chart SVG trong `StockChart` |
| 8 | Bộ lọc trạng thái / cấp độ / hạng dùng **`FilterDropdown` đặt ngay sau ô tìm kiếm** (có số đếm), không dùng hàng tab | Tồn kho → "Mức tồn", Khách hàng → "Hạng thành viên" |

## 2. Cấu trúc thư mục

```
src/
├── assets/images/          logo, ảnh tĩnh
├── components/
│   ├── common/             Logo, ComingSoon, ProductCode, RouteGuards
│   ├── layout/             MainLayout, Sidebar, Header, PageBar
│   └── ui/                 UI kit tự viết (Button, Drawer, Modal, Dropdown, DatePicker...)
├── config/navigation.ts    menu sidebar
├── hooks/                  hook dùng chung (useDebounce, useBarcodeScanner, useLastValue...)
├── lib/                    hàm thuần dùng chung (cn, format, http, barcode, sound, image)
├── modules/<module>/       mỗi nghiệp vụ một module
├── routes/                 router.tsx (lazy page) + paths.ts (hằng đường dẫn)
├── styles/globals.css      theme Tailwind v4 + animation
└── types/                  type dùng chung toàn app
```

### Cấu trúc một module

```
modules/products/
├── components/   UI con của module (bảng, form, drawer, modal)
├── hooks/        logic: use<Tên>Page (hook tổng của trang), use<Tên>Form, use<Tên>Data...
├── mocks/        dữ liệu mẫu (mảng mutable, là "database" khi chạy mock)
├── pages/        <Tên>Page.tsx — export default, chỉ ghép component
├── services/     <tên>.service.ts — gọi API hoặc thao tác mock
├── types/        <tên>.types.ts
└── utils/        <tên>.utils.ts — hằng số, hàm thuần (lọc, sắp xếp, validate, format)
```

Thư mục nào chưa cần thì không tạo file rỗng.

## 3. Luồng dữ liệu

```
Page (UI)  →  use<Page>Page (state, filter, action)  →  service  →  mock array | http API
                    │
                    └── truyền props xuống components (components không gọi service trực tiếp*)
```

\* Ngoại lệ nhỏ: component tự chứa (VD `VoucherInput`) được phép gọi service qua hook riêng.

- **Hook trang** (`useProductsPage`, `useSuppliersPage`...) trả về một object phẳng: dữ liệu, bộ lọc, trạng thái mở/đóng drawer/modal, và các action (`openCreate`, `submitForm`, `confirmDelete`...).
- Hook lớn thì tách: `useInventoryPage` ghép `useInventoryData` + `useStockList` + `useMovementHistory` + `usePurchaseOrders`.
- **Service** luôn có dạng:

```ts
export const productsService = {
  async getProducts(): Promise<Product[]> {
    if (!USE_MOCK) return http.get<Product[]>('/api/products')
    await sleep(300)
    return structuredClone(MOCK_PRODUCTS)
  },
}
```

  - Nhánh API viết trước (`if (!USE_MOCK) return http...`), nhánh mock sau.
  - Mock có `sleep()` để giả lập độ trễ, trả về `structuredClone(...)` để UI không sửa trực tiếp mảng mock.
  - Đường dẫn API trong service chính là **hợp đồng** với Backend.
- **Mock** là mảng `MOCK_*` export từ `mocks/`, dùng chung giữa các module (VD `MOCK_ORDERS` được products, inventory, customers, promotions cùng đọc). Thao tác ghi (tạo đơn, nhập kho...) sửa thẳng vào mảng này để mọi trang thấy dữ liệu đồng nhất.

## 4. Đặt tên

| Loại | Quy ước | Ví dụ |
|------|---------|-------|
| Component | PascalCase, tên file = tên component | `SupplierTable.tsx` |
| Page | `<Tên>Page.tsx`, `export default function` | `CustomersPage.tsx` |
| Hook | `use<Tên>.ts` | `usePromotionForm.ts` |
| Service | `<tên>.service.ts`, export object `<tên>Service` | `purchasing.service.ts` → `purchasingService` |
| Types | `<tên>.types.ts` | `suppliers.types.ts` |
| Utils | `<tên>.utils.ts` | `receiving.utils.ts` |
| Mock | `<tên>.mock.ts`, export `MOCK_<TÊN>` | `MOCK_PURCHASE_ORDERS` |
| Hằng số | UPPER_SNAKE_CASE | `PROMOTION_STATUS`, `PAGE_SIZE` |
| Map nhãn/màu theo enum | `Record<Enum, { label, tone }>` | `SUPPLIER_STATUS`, `PO_STATUS` |
| Đường dẫn | khai báo trong `PATHS` | `PATHS.inventory` |

Text hiển thị cho người dùng viết **tiếng Việt có dấu**; tên biến, hàm, type viết **tiếng Anh**.

## 5. Thứ tự import

Không có tool tự sắp xếp, giữ theo thứ tự:

1. `react`, thư viện ngoài (`react-router-dom`, `lucide-react`, `sonner`)
2. `@/components/...`
3. `@/hooks/...`
4. `@/lib/...`
5. `@/modules/...` (module hiện tại và module khác)
6. `@/routes/...`, `@/types/...`

Dùng `import type { ... }` cho import chỉ có kiểu (bắt buộc do `verbatimModuleSyntax`).

## 6. Thêm module / trang mới

1. Tạo `src/modules/<module>/` theo cấu trúc ở mục 2.
2. Thêm đường dẫn vào `src/routes/paths.ts`.
3. Thêm route lazy vào `src/routes/router.tsx` (bên trong layout có `RequireAuth`).
4. Thêm menu vào `src/config/navigation.ts` (nếu chưa có).
5. Trang danh sách làm theo mẫu trong [`UI_PATTERNS.md`](./UI_PATTERNS.md).
6. Chạy `npm run typecheck` trước khi commit.

## 7. Kiểm tra trước khi commit

- `npm run typecheck` không lỗi (`strict`, `noUnusedLocals`, `noUnusedParameters` đang bật).
- Không còn comment, `console.log`, import thừa.
- Không có file `index.ts`, không import tương đối.
- Mọi thao tác ghi đều có toast thành công/thất bại.
