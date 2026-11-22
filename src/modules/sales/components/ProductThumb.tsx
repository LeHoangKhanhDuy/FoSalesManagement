import { memo, useState, type SyntheticEvent } from 'react'
import { Apple, Cookie, CupSoda, Milk, Package, Soup, SprayCan, WashingMachine, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ImageFit, Product } from '@/modules/sales/types/sales.types'

type CategoryKey = Product['categoryId']

/**
 * Cấu hình hiển thị theo danh mục:
 * - `cover`  : ảnh chụp thực tế (trái cây, đồ tươi) → lấp đầy khung, crop nhẹ
 * - `contain`: ảnh bao bì đứng/dọc (chai, lon, hộp sữa) → hiện trọn vẹn, có khoảng đệm
 * - `auto`   : tự chọn theo tỉ lệ ảnh — gần tỉ lệ khung thì `cover`, lệch nhiều thì `contain`
 */
const VISUALS: Record<CategoryKey, { icon: LucideIcon; tone: string; fit: ImageFit }> = {
  drinks: { icon: CupSoda, tone: 'from-sky-50 to-sky-100 text-sky-600', fit: 'contain' },
  snacks: { icon: Cookie, tone: 'from-amber-50 to-orange-100 text-amber-600', fit: 'auto' },
  dairy: { icon: Milk, tone: 'from-indigo-50 to-blue-100 text-indigo-500', fit: 'contain' },
  instant: { icon: Soup, tone: 'from-orange-50 to-red-100 text-orange-600', fit: 'auto' },
  fruit: { icon: Apple, tone: 'from-lime-50 to-green-100 text-green-600', fit: 'cover' },
  personal: { icon: SprayCan, tone: 'from-pink-50 to-fuchsia-100 text-pink-600', fit: 'contain' },
  household: { icon: WashingMachine, tone: 'from-teal-50 to-cyan-100 text-teal-600', fit: 'contain' },
}

const FALLBACK = { icon: Package, tone: 'from-slate-50 to-slate-100 text-slate-500', fit: 'auto' as ImageFit }

/** Tỉ lệ khung cố định (rộng / cao) — mọi card có cùng kích thước ảnh */
const FRAME_RATIO = { lg: 4 / 3, sm: 1 } as const
/** Ảnh lệch tỉ lệ khung quá ngưỡng này sẽ chuyển sang `contain` để không bị cắt mất sản phẩm */
const AUTO_COVER_TOLERANCE = 0.15

type Orientation = 'portrait' | 'landscape' | 'square'

const getOrientation = (ratio: number): Orientation => (ratio < 0.9 ? 'portrait' : ratio > 1.1 ? 'landscape' : 'square')

const resolveFit = (fit: ImageFit, ratio: number | null, frameRatio: number): Exclude<ImageFit, 'auto'> => {
  if (fit !== 'auto') return fit
  if (ratio === null) return 'contain'
  return Math.abs(ratio / frameRatio - 1) <= AUTO_COVER_TOLERANCE ? 'cover' : 'contain'
}

interface ProductThumbProps {
  categoryId: CategoryKey
  image?: string
  alt?: string
  /** Ghi đè cách hiển thị của danh mục cho từng sản phẩm */
  fit?: ImageFit
  size?: 'sm' | 'lg'
  className?: string
}

export const ProductThumb = memo(function ProductThumb({
  categoryId,
  image,
  alt = '',
  fit,
  size = 'lg',
  className,
}: ProductThumbProps) {
  const visual = VISUALS[categoryId] ?? FALLBACK
  const Icon = visual.icon
  const [meta, setMeta] = useState<{ src: string; ratio: number } | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const hasImage = !!image && failedSrc !== image
  const ratio = meta && meta.src === image ? meta.ratio : null
  const loaded = hasImage && ratio !== null
  const mode = resolveFit(fit ?? visual.fit, ratio, FRAME_RATIO[size])
  const orientation = ratio !== null ? getOrientation(ratio) : undefined

  const onLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setMeta({ src: e.currentTarget.getAttribute('src') ?? '', ratio: w && h ? w / h : 1 })
  }

  return (
    <div
      data-orientation={orientation}
      data-fit={hasImage ? mode : undefined}
      className={cn(
        'relative isolate grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br',
        visual.tone,
        size === 'lg' ? 'aspect-[4/3] w-full rounded-lg' : 'size-12 rounded-lg',
        className,
      )}
    >
      {/* Icon danh mục: placeholder khi chưa có ảnh / đang tải / lỗi ảnh */}
      {!loaded && (
        <Icon
          className={cn(size === 'lg' ? 'size-10 drop-shadow-sm' : 'size-5', hasImage && 'animate-pulse opacity-60')}
          strokeWidth={1.75}
        />
      )}

      {hasImage && (
        <>
          {/* Nền xám nhạt + multiply → ảnh bao bì nền trắng hòa vào khung, mọi ô ảnh đồng màu */}
          {loaded && mode === 'contain' && <span className="absolute inset-0 -z-10 bg-slate-50" />}
          <img
            key={image}
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={onLoad}
            onError={() => setFailedSrc(image)}
            className={cn(
              'absolute inset-0 h-full w-full transition-[opacity,transform] duration-300 select-none',
              loaded ? 'opacity-100' : 'opacity-0',
              mode === 'cover'
                ? 'object-cover group-hover:scale-105'
                : cn(
                    'object-contain mix-blend-multiply',
                    // Đệm theo hướng ảnh: ảnh dọc chừa ít trên/dưới, ảnh ngang chừa ít trái/phải
                    size === 'lg'
                      ? orientation === 'portrait'
                        ? 'px-4 py-2'
                        : orientation === 'landscape'
                          ? 'px-2 py-4'
                          : 'p-3'
                      : 'p-1',
                  ),
            )}
          />
        </>
      )}
    </div>
  )
})
