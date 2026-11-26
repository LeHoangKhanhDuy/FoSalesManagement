import { memo } from 'react'
import { createPortal } from 'react-dom'
import { code128Bars } from '@/lib/code128'
import { formatDateTime, formatNumber } from '@/lib/format'
import type { ReceiptData } from '@/modules/orders/types/orders.types'

const Barcode = ({ value }: { value: string }) => {
  const { bars, width } = code128Bars(value)
  return (
    <svg className="barcode" viewBox={`-10 0 ${width + 20} 40`} width={(width + 20) * 1.4} preserveAspectRatio="none" shapeRendering="crispEdges">
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={0} width={b.w} height={40} fill="#000" />
      ))}
    </svg>
  )
}

const Row = ({ label, value, className }: { label: string; value: string; className?: string }) => (
  <div className={className ? `row ${className}` : 'row'}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

const minus = (v: number) => `-${formatNumber(v)}`

export const Receipt = memo(function Receipt({ data }: { data: ReceiptData }) {
  const { store, order, customer, lines, summary, payments } = data
  const contact = [store.phone && `Hotline: ${store.phone}`, store.taxCode && `MST: ${store.taxCode}`].filter(Boolean).join(' · ')
  const branch = [store.branchName, store.code].filter(Boolean).join(' · ')

  return (
    <div className="receipt">
      <div className="c">
        <div className="store">{store.name}</div>
        {branch && <div className="muted">{branch}</div>}
        {store.address && <div className="muted">{store.address}</div>}
        {contact && <div className="muted">{contact}</div>}
      </div>
      <div className="hr2" />
      <div className="c title">HÓA ĐƠN BÁN LẺ{order.printCount > 0 ? ' (IN LẠI)' : ''}</div>
      <div className="c code">{order.code}</div>
      <div className="hr" />
      <Row label="Ngày:" value={formatDateTime(new Date(order.createdAt))} />
      <Row label="Thu ngân:" value={order.cashier} />
      {customer && (
        <>
          <div className="row">
            <span>Khách hàng:</span>
            <span className="b">{customer.name}</span>
          </div>
          <Row label="SĐT / Hạng:" value={[customer.maskedPhone, customer.tierLabel].filter(Boolean).join(' · ')} />
        </>
      )}
      <div className="hr" />
      <div className="head">
        <span>Mặt hàng</span>
        <span>Thành tiền</span>
      </div>
      {lines.map((l, i) => (
        <div key={i} className="item">
          <div className="name">
            {l.name}
            {l.isGift && <span className="badge">QUÀ TẶNG</span>}
          </div>
          <div className="sub">
            <span>
              {l.quantity} {l.unit} × {formatNumber(l.price)}
            </span>
            <span>{formatNumber(l.amount)}</span>
          </div>
          {l.productDiscount > 0 && (
            <div className="disc">
              <span>KM: {l.promoName ?? 'Khuyến mãi'}</span>
              <span>{minus(l.productDiscount)}</span>
            </div>
          )}
        </div>
      ))}
      <div className="hr" />
      <Row label={`Tổng tiền hàng (${summary.itemCount} sp)`} value={formatNumber(summary.subtotal)} />
      {summary.productDiscount > 0 && <Row label="Khuyến mãi sản phẩm" value={minus(summary.productDiscount)} />}
      {summary.orderPromos.map((p) => (
        <Row key={p.name} label={`KM đơn: ${p.name}`} value={minus(p.amount)} />
      ))}
      {summary.voucher && <Row label={`Voucher ${summary.voucher.code}`} value={minus(summary.voucher.amount)} />}
      {summary.memberDiscount && (
        <Row label={`Ưu đãi hạng ${summary.memberDiscount.label} (${summary.memberDiscount.percent}%)`} value={minus(summary.memberDiscount.amount)} />
      )}
      <div className="hr2" />
      <Row label="TỔNG THANH TOÁN" value={formatNumber(summary.total)} className="total" />
      <div className="hr2" />
      {payments.map((p) => (
        <div key={p.method}>
          <Row label={p.method === 'cash' && p.tendered ? `${p.label} khách đưa` : p.label} value={formatNumber(p.method === 'cash' && p.tendered ? p.tendered : p.amount)} />
          {p.reference && <Row label="Mã giao dịch" value={p.reference} className="muted" />}
        </div>
      ))}
      {data.changeAmount > 0 && <Row label="Tiền thừa trả khách" value={formatNumber(data.changeAmount)} className="b" />}
      <Row label="Đã bao gồm VAT 8%" value={`(${formatNumber(summary.vatIncluded)})`} className="muted" />
      {customer && (
        <>
          <div className="hr" />
          {customer.pointsEarned > 0 && (
            <div className="row">
              <span>Điểm tích lũy đơn này</span>
              <span className="b">+{formatNumber(customer.pointsEarned)} điểm</span>
            </div>
          )}
          <Row label="Tổng điểm hiện có" value={`${formatNumber(customer.pointsBalance)} điểm`} />
        </>
      )}
      <div className="hr" />
      <div className="c b">{store.receiptFooter || 'CẢM ƠN QUÝ KHÁCH – HẸN GẶP LẠI!'}</div>
      {store.returnPolicy && <div className="c muted">{store.returnPolicy}</div>}
      <Barcode value={data.barcode || order.code} />
      <div className="c muted">In lúc {formatDateTime(new Date())} · FoSales</div>
    </div>
  )
})

export function PrintReceipt({ data }: { data: ReceiptData | null }) {
  if (!data) return null
  return createPortal(
    <div className="print-receipt">
      <Receipt data={data} />
    </div>,
    document.body,
  )
}
