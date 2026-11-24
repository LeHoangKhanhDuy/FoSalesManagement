# FoSales — Sales Management (FE)

Nền tảng bán hàng, quản lý & thống kê của FoTech. Màu chủ đạo `#16A34A`.

**Stack:** React 19 · TypeScript · Vite · TailwindCSS v4 · lucide-react · sonner (toast) · React Router · deploy Vercel

## Tài liệu cho dev

- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) — cấu trúc thư mục, module, luồng dữ liệu, đặt tên, quy tắc bắt buộc
- [`docs/CODE_STYLE.md`](docs/CODE_STYLE.md) — cách viết TypeScript/React/hook/form, Tailwind, văn phong giao diện
- [`docs/UI_PATTERNS.md`](docs/UI_PATTERNS.md) — màu sắc, UI kit, bố cục trang danh sách, drawer, modal
- [`CLAUDE.md`](CLAUDE.md) — bản tóm tắt quy ước cho AI assistant

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + build ra dist/
npm run preview
```

Copy `.env.example` → `.env.local` khi kết nối BE:

```
VITE_API_BASE_URL=https://api.fosales.vn
VITE_USE_MOCK=false
```

## Cấu trúc thư mục

```
src/
├── assets/          # ảnh, logo, font
├── components/
│   ├── common/      # Logo, ComingSoon...
│   ├── layout/      # MainLayout, Sidebar, Header, PageBar (breadcrumb + giờ)
│   └── ui/          # Button, Input, Badge, Card, Modal, Kbd, Avatar, EmptyState
├── config/          # navigation (menu sidebar)
├── hooks/           # useDebounce, useHotkey, useClock, useLocalStorage, useClickOutside
├── lib/             # cn, format (tiền tệ/ngày), http (fetch wrapper), constants
├── modules/
│   └── sales/       # Module Bán hàng (POS)
│       ├── components/
│       ├── hooks/      # useProducts, useInvoices, useSalesStats
│       ├── mocks/      # data mẫu trước khi kết nối BE
│       ├── pages/      # SalesPage
│       ├── services/   # salesService (tự chuyển mock ↔ API qua VITE_USE_MOCK)
│       ├── types/
│       └── utils/
├── routes/          # router.tsx + paths.ts
├── styles/          # globals.css (theme Tailwind v4: primary-50..950)
└── types/           # type dùng chung
```

Quy ước import: không dùng file `index.ts` (barrel), import trực tiếp từ file và **luôn dùng alias `@/`** (không dùng `./`, `../`), vd `@/components/ui/Button`, `@/modules/sales/hooks/useProducts`.

Tạo module mới: copy cấu trúc `modules/sales` → `modules/<ten-module>`, thêm route trong `src/routes/router.tsx` và menu trong `src/config/navigation.ts`.

## Màn hình Bán hàng (POS) — `/sales/pos`

- Nhiều hóa đơn song song (tab), tự lưu nháp vào localStorage
- Tìm theo tên (không dấu), SKU, quét mã vạch + Enter để thêm nhanh
- Lọc danh mục, sắp xếp, xem dạng lưới / danh sách, cảnh báo tồn kho
- Chọn khách hàng thành viên, giảm giá theo đ hoặc %, ghi chú
- Thanh toán: tiền mặt (gợi ý mệnh giá, tính tiền thừa), chuyển khoản (QR), thẻ, ví
- Phím tắt: `F2` tìm sản phẩm · `F4` hóa đơn mới · `F9` thanh toán · `Ctrl K` tìm kiếm chung

## Deploy Vercel

Đã có `vercel.json` (SPA rewrite). Import repo trên Vercel → Framework: Vite → Deploy.
# FoSalesManagement
