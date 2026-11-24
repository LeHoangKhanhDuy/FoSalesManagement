import { BadgePercent, Boxes, ScanBarcode, TrendingUp, Users } from 'lucide-react'
import logo from '@/assets/images/logo.png'
import { APP_SUBTITLE } from '@/lib/constants'

const FEATURES = [
  { icon: ScanBarcode, title: 'Bán hàng siêu tốc', text: 'Quét mã vạch, nhiều hóa đơn cùng lúc, thanh toán chỉ vài giây' },
  { icon: Boxes, title: 'Tồn kho chính xác', text: 'Nhập hàng, kiểm đếm, cảnh báo sắp hết theo thời gian thực' },
  { icon: Users, title: 'Khách hàng thân thiết', text: 'Hạng thành viên, tích điểm và khuyến mãi tự động' },
]

const BARS = [38, 52, 44, 63, 58, 72, 86]

export function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-10 text-white lg:flex lg:flex-col xl:p-14">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top_left,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-primary-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-white shadow-lg">
          <img src={logo} alt="FoSales" className="size-10 object-contain" />
        </span>
        <div className="leading-tight">
          <p className="text-xl font-extrabold tracking-tight">FoSales Management</p>
          <p className="text-xs font-medium text-white/70">{APP_SUBTITLE}</p>
        </div>
      </div>

      <div className="relative mt-auto max-w-lg">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-300" /> Hệ thống bán lẻ cho cửa hàng hiện đại
        </p>
        <h2 className="mt-5 text-4xl leading-[1.15] font-extrabold tracking-tight xl:text-[44px]">
          Bán hàng nhanh hơn,
          <br />
          quản lý <span className="text-emerald-200">thông minh</span> hơn.
        </h2>
        <ul className="mt-8 space-y-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-sm text-white/70">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-10 mb-auto flex gap-4">
        <div className="w-64 animate-slide-up rounded-xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/70">Doanh thu hôm nay</p>
            <span className="flex items-center gap-1 rounded-full bg-emerald-300/20 px-2 py-0.5 text-[11px] font-bold text-emerald-100">
              <TrendingUp className="size-3" /> 18%
            </span>
          </div>
          <p className="mt-1 text-2xl font-extrabold">12.480.000đ</p>
          <div className="mt-3 flex h-14 items-end gap-1.5">
            {BARS.map((h, i) => (
              <span key={i} className="flex-1 rounded-t bg-white/70" style={{ height: `${h}%`, opacity: 0.45 + i * 0.08 }} />
            ))}
          </div>
        </div>
        <div className="mt-8 h-fit w-56 animate-slide-up rounded-xl bg-white p-3.5 text-slate-800 shadow-2xl [animation-delay:120ms]">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-500">
              <BadgePercent className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold">Mua 2 tặng 1</p>
              <p className="truncate text-[11px] text-slate-400">Đã áp dụng cho 24 đơn</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-primary-500" />
          </div>
        </div>
      </div>

      <p className="relative text-xs text-white/60">© {new Date().getFullYear()} FoTech Solutions. All rights reserved.</p>
    </div>
  )
}
