# FoSales FE — hướng dẫn cho AI assistant

React 19 + TypeScript (strict) + Vite 7 + Tailwind v4 + lucide-react + sonner + react-router-dom 7. Màu chủ đạo `#16A34A` (token `primary-*`).

Đọc đầy đủ: `docs/CONVENTIONS.md`, `docs/CODE_STYLE.md`, `docs/UI_PATTERNS.md`.

## Luôn tuân thủ

- Không viết comment trong code. Không tạo file `index.ts`. Import luôn bằng `@/...`, dùng `import type` cho kiểu.
- Page chỉ ghép UI; state và logic nằm trong hook `use<Tên>Page`. Component nhận props, không gọi service.
- Service: `if (!USE_MOCK) return http.<method>('/api/...')` trước, nhánh mock (`await sleep()`, sửa mảng `MOCK_*`, trả `structuredClone`) sau.
- File ngắn (~<200 dòng), tách component/hook/utils khi dài. Không thêm thư viện UI mới.
- 2 spaces, nháy đơn, không chấm phẩy. Text giao diện tiếng Việt có dấu, code tiếng Anh.
- Định dạng qua `@/lib/format` (`formatCurrency`, `formatNumber`, `formatDateTime`, `removeAccents`), ghép class bằng `cn()`.
- Trang danh sách theo mẫu: tiêu đề + nút → 4 thẻ thống kê → Card (toolbar lọc + bảng + Pagination) → Drawer/Modal.
- Bộ lọc trạng thái/cấp độ/hạng là `FilterDropdown` (có `count`) đặt ngay sau ô tìm kiếm, không dùng hàng tab.
- Mọi nơi hiển thị sản phẩm phải có barcode (`ProductCode`).
- Drawer form dùng `useLastValue` + session key; form chỉ hiện lỗi sau lần submit đầu; mọi thao tác ghi có toast.
- Xóa dữ liệu đã phát sinh giao dịch: không cho phép, gợi ý khóa/ngừng/kết thúc.

## Kiểm tra

`npm run typecheck` phải sạch trước khi hoàn tất.
