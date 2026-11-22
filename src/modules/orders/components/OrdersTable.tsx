import { memo, type ReactNode } from "react";
import {
  Ban,
  CircleCheck,
  Ellipsis,
  Eye,
  PackageSearch,
  Printer,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type {
  OrderAction,
  OrderRecord,
} from "@/modules/orders/types/orders.types";
import { ORDER_STATUS, PAGE_SIZE } from "@/modules/orders/utils/orders.utils";
import { PAYMENT_METHOD_LABEL } from "@/modules/sales/utils/constants";
import { ProductCode } from "@/components/common/ProductCode";

interface OrdersTableProps {
  orders: OrderRecord[];
  total: number;
  page: number;
  loading: boolean;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
  onView: (order: OrderRecord) => void;
  onAction: (order: OrderRecord, action: OrderAction) => void;
  onConfirmPayment: (order: OrderRecord) => void;
  onPrint: (order: OrderRecord) => void;
  onResetFilters: () => void;
}

const COLUMNS: { label: string; className?: string }[] = [
  { label: "Mã đơn" },
  { label: "Khách hàng" },
  { label: "Sản phẩm" },
  { label: "Thanh toán" },
  { label: "Tổng tiền", className: "text-right" },
  { label: "Trạng thái" },
  { label: "Thu ngân" },
  { label: "", className: "w-24" },
];

const Cell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <td className={cn("px-4 py-3.5 align-middle", className)}>{children}</td>;

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${formatTime(d)} · ${formatDate(d).replace(/^[^,]+,\s*/, "")}`;
};

function RowActions({
  order,
  onView,
  onAction,
  onConfirmPayment,
  onPrint,
}: Omit<
  OrdersTableProps,
  | "orders"
  | "total"
  | "page"
  | "loading"
  | "hasActiveFilters"
  | "onPageChange"
  | "onResetFilters"
> & { order: OrderRecord }) {
  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Dropdown
        align="end"
        trigger={
          <button
            className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
            aria-label="Thao tác khác"
          >
            <Ellipsis className="size-4" />
          </button>
        }
      >
        <DropdownItem
          icon={Eye}
          label="Xem chi tiết"
          onClick={() => onView(order)}
        />
        <DropdownItem
          icon={Printer}
          label="In hóa đơn"
          onClick={() => onPrint(order)}
        />
        {order.status === "pending" && (
          <>
            <DropdownSeparator />
            <DropdownItem
              icon={CircleCheck}
              label="Xác nhận đã thanh toán"
              onClick={() => onConfirmPayment(order)}
            />
            <DropdownItem
              icon={Ban}
              label="Hủy đơn"
              danger
              onClick={() => onAction(order, "cancel")}
            />
          </>
        )}
        {order.status === "completed" && (
          <>
            <DropdownSeparator />
            <DropdownItem
              icon={Undo2}
              label="Hoàn tiền"
              danger
              onClick={() => onAction(order, "refund")}
            />
          </>
        )}
      </Dropdown>
    </div>
  );
}

export const OrdersTable = memo(function OrdersTable(props: OrdersTableProps) {
  const {
    orders,
    total,
    page,
    loading,
    hasActiveFilters,
    onPageChange,
    onView,
    onResetFilters,
  } = props;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {COLUMNS.map((c) => (
                <th
                  key={c.label || "actions"}
                  className={cn("px-4 py-3 whitespace-nowrap", c.className)}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {COLUMNS.map((_, j) => (
                    <Cell key={j}>
                      <div
                        className={cn(
                          "h-4 animate-pulse rounded bg-slate-100",
                          j === 0 ? "w-28" : j === 7 ? "ml-auto w-14" : "w-24",
                        )}
                      />
                    </Cell>
                  ))}
                </tr>
              ))}

            {!loading &&
              orders.map((o) => {
                const status = ORDER_STATUS[o.status];
                const inactive =
                  o.status === "cancelled" || o.status === "refunded";
                return (
                  <tr
                    key={o.id}
                    onClick={() => onView(o)}
                    className="group cursor-pointer transition hover:bg-slate-50/80"
                  >
                    <Cell>
                      <p className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-primary-700">
                        {o.code}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {shortDate(o.createdAt)}
                      </p>
                    </Cell>
                    <Cell>
                      {o.customer ? (
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={o.customer.name}
                            className="size-8 text-[11px]"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">
                              {o.customer.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {o.customer.phone}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Khách lẻ</span>
                      )}
                    </Cell>
                    <Cell className="max-w-[220px]">
                      <p className="font-semibold text-slate-800">
                        {o.items[0]?.name}
                        {/* {o.items.length > 1 && ` +${o.items.length - 1}`} */}
                      </p>
                      <ProductCode
                        barcode={o.items[0]?.barcode}
                        extra={`SL: ${o.totals.itemCount}`}
                      />
                    </Cell>
                    <Cell>
                      <span className="flex items-center gap-2 whitespace-nowrap text-slate-600">
                        {PAYMENT_METHOD_LABEL[o.paymentMethod]}
                      </span>
                    </Cell>
                    <Cell className="text-right whitespace-nowrap">
                      <p
                        className={cn(
                          "font-bold",
                          inactive
                            ? "text-slate-400 line-through"
                            : "text-slate-900",
                        )}
                      >
                        {formatCurrency(o.totals.total)}
                      </p>
                      {o.totals.discountAmount > 0 && (
                        <p className="text-xs text-rose-500">
                          {o.voucher && (
                            <span className="text-slate-400">
                              {o.voucher.code} |{" "}
                            </span>
                          )}
                          -{formatCurrency(o.totals.discountAmount)}
                        </p>
                      )}
                    </Cell>
                    <Cell>
                      <Badge
                        tone={status.tone}
                        dot
                        className="whitespace-nowrap"
                      >
                        {status.label}
                      </Badge>
                    </Cell>
                    <Cell className="whitespace-nowrap text-slate-600">
                      {o.cashier}
                    </Cell>
                    <Cell>
                      <RowActions order={o} {...props} />
                    </Cell>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {!loading && orders.length === 0 && (
          <EmptyState
            icon={<PackageSearch />}
            title="Không có đơn hàng phù hợp"
            description="Thử thay đổi từ khóa, khoảng thời gian hoặc bộ lọc trạng thái."
            className="py-16"
            action={
              hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="size-4" /> Xóa bộ lọc
                </button>
              )
            }
          />
        )}
      </div>

      {!loading && total > 0 && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={onPageChange}
          unit="đơn hàng"
          className="border-t border-slate-100 px-4 py-3"
        />
      )}
    </div>
  );
});
