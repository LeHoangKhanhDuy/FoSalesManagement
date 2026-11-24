import type { ReactNode } from "react";
import {
  ClipboardPlus,
  Ellipsis,
  Eye,
  PauseCircle,
  Pencil,
  PlayCircle,
  Power,
  Trash2,
  Truck,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { formatCurrency, timeAgo } from "@/lib/format";
import type {
  Supplier,
  SupplierStatus,
  SupplierSummary,
} from "@/modules/suppliers/types/suppliers.types";
import {
  EMPTY_SUMMARY,
  formatPhone,
  SUPPLIER_STATUS,
  termLabel,
} from "@/modules/suppliers/utils/suppliers.utils";

interface Props {
  suppliers: Supplier[];
  summaries: Record<string, SupplierSummary>;
  loading: boolean;
  hasActiveFilters: boolean;
  onView: (s: Supplier) => void;
  onEdit: (s: Supplier) => void;
  onPay: (s: Supplier) => void;
  onOrder: (s: Supplier) => void;
  onChangeStatus: (s: Supplier, status: SupplierStatus) => void;
  onDelete: (s: Supplier) => void;
  onCreate: () => void;
}

const COLUMNS = [
  "Nhà cung cấp",
  "Liên hệ",
  "Đơn hàng",
  "Tổng nhập",
  "Nợ phải trả",
  "Nhập gần nhất",
  "Trạng thái",
  "",
];

const Td = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;

export function SupplierTable({
  suppliers,
  summaries,
  loading,
  hasActiveFilters,
  onView,
  onEdit,
  onPay,
  onOrder,
  onChangeStatus,
  onDelete,
  onCreate,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {COLUMNS.map((c, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-3 whitespace-nowrap",
                  ["Tổng nhập", "Nợ phải trả"].includes(c) && "text-right",
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {COLUMNS.map((_, j) => (
                    <Td key={j}>
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                    </Td>
                  ))}
                </tr>
              ))
            : suppliers.map((s) => {
                const m = summaries[s.id] ?? EMPTY_SUMMARY;
                const inactive = s.status === "inactive";
                const status = SUPPLIER_STATUS[s.status];
                return (
                  <tr
                    key={s.id}
                    onClick={() => onView(s)}
                    className={cn(
                      "group cursor-pointer transition hover:bg-slate-50/80",
                      inactive && "opacity-60",
                    )}
                  >
                    <Td className="max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} className="size-10 rounded-lg" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 group-hover:text-primary-700">
                            {s.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {s.code}
                            {s.taxCode && ` · MST ${s.taxCode}`}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <p className="font-medium text-slate-800">{s.contact}</p>
                      <p className="text-xs text-slate-400">
                        {formatPhone(s.phone)}
                      </p>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <p className="font-medium text-slate-800">
                        {m.orderCount} đơn
                      </p>
                      {m.openOrders > 0 ? (
                        <p className="text-xs font-semibold text-sky-600">
                          {m.openOrders} đang chờ giao
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Hạn TT: {termLabel(s.paymentTermDays)}
                        </p>
                      )}
                    </Td>
                    <Td className="text-right font-semibold whitespace-nowrap text-slate-800">
                      {m.purchased ? formatCurrency(m.purchased) : "—"}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      {m.debt > 0 ? (
                        <>
                          <p
                            className={cn(
                              "font-bold",
                              m.overdue ? "text-rose-600" : "text-amber-600",
                            )}
                          >
                            {formatCurrency(m.debt)}
                          </p>
                          {m.overdue > 0 ? (
                            <p className="text-[11px] font-semibold text-rose-500">
                              Quá hạn {formatCurrency(m.overdue)}
                            </p>
                          ) : (
                            m.nextDueAt && (
                              <p className="text-[11px] text-slate-400">
                                Hạn{" "}
                                {new Date(m.nextDueAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </p>
                            )
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">0đ</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600">
                      {timeAgo(m.lastReceiptAt)}
                    </Td>
                    <Td>
                      <Badge
                        tone={status.tone}
                        dot
                        className="whitespace-nowrap"
                        title={s.suspendReason}
                      >
                        {status.label}
                      </Badge>
                      {s.status === "suspended" && (
                        <p
                          className="mt-1 max-w-[150px] truncate text-[11px] text-amber-600"
                          title={s.suspendReason}
                        >
                          {s.suspendedUntil
                            ? `Đến ${new Date(s.suspendedUntil).toLocaleDateString("vi-VN")}`
                            : s.suspendReason}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {m.debt > 0 && (
                          <button
                            onClick={() => onPay(s)}
                            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold whitespace-nowrap text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
                          >
                            Thanh toán
                          </button>
                        )}
                        <Dropdown
                          align="end"
                          trigger={
                            <button
                              className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              aria-label="Thao tác khác"
                            >
                              <Ellipsis className="size-4" />
                            </button>
                          }
                        >
                          <DropdownItem
                            icon={Eye}
                            label="Xem chi tiết"
                            onClick={() => onView(s)}
                          />
                          <DropdownItem
                            icon={Pencil}
                            label="Chỉnh sửa"
                            onClick={() => onEdit(s)}
                          />
                          {s.status === "active" && (
                            <DropdownItem
                              icon={ClipboardPlus}
                              label="Tạo đơn đặt hàng"
                              onClick={() => onOrder(s)}
                            />
                          )}
                          <DropdownSeparator />
                          {s.status !== "active" && (
                            <DropdownItem
                              icon={PlayCircle}
                              label="Mở lại hợp tác"
                              onClick={() => onChangeStatus(s, "active")}
                            />
                          )}
                          {s.status === "active" && (
                            <DropdownItem
                              icon={PauseCircle}
                              label="Tạm ngưng"
                              onClick={() => onChangeStatus(s, "suspended")}
                            />
                          )}
                          {!inactive && (
                            <DropdownItem
                              icon={Power}
                              label="Ngừng hợp tác"
                              onClick={() => onChangeStatus(s, "inactive")}
                            />
                          )}
                          <DropdownSeparator />
                          <DropdownItem
                            icon={Trash2}
                            label="Xóa"
                            danger
                            onClick={() => onDelete(s)}
                          />
                        </Dropdown>
                      </div>
                    </Td>
                  </tr>
                );
              })}
        </tbody>
      </table>
      {!loading && suppliers.length === 0 && (
        <EmptyState
          icon={<Truck />}
          title={
            hasActiveFilters
              ? "Không tìm thấy nhà cung cấp"
              : "Chưa có nhà cung cấp"
          }
          description={
            hasActiveFilters
              ? "Thử đổi từ khóa hoặc bộ lọc khác."
              : "Thêm nhà cung cấp để bắt đầu đặt hàng và theo dõi công nợ."
          }
          action={
            !hasActiveFilters && (
              <button
                onClick={onCreate}
                className="cursor-pointer text-sm font-semibold text-primary-600"
              >
                + Thêm nhà cung cấp
              </button>
            )
          }
          className="py-14"
        />
      )}
    </div>
  );
}
