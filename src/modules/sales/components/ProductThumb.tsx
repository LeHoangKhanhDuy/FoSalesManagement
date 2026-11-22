import { memo, useState, type SyntheticEvent } from 'react'
import { cn } from '@/lib/cn'
import { getCategoryVisual } from '@/modules/categories/utils/category-visuals'
import type { ImageFit } from '@/modules/sales/types/sales.types'

const FRAME_RATIO = { lg: 4 / 3, sm: 1 } as const
const AUTO_COVER_TOLERANCE = 0.15

type Orientation = 'portrait' | 'landscape' | 'square'

const getOrientation = (ratio: number): Orientation => (ratio < 0.9 ? 'portrait' : ratio > 1.1 ? 'landscape' : 'square')

const resolveFit = (fit: ImageFit, ratio: number | null, frameRatio: number): Exclude<ImageFit, 'auto'> => {
  if (fit !== 'auto') return fit
  if (ratio === null) return 'contain'
  return Math.abs(ratio / frameRatio - 1) <= AUTO_COVER_TOLERANCE ? 'cover' : 'contain'
}

interface ProductThumbProps {
  categoryId: string
  icon?: string
  color?: string
  image?: string
  alt?: string
  fit?: ImageFit
  size?: 'sm' | 'lg'
  className?: string
}

export const ProductThumb = memo(function ProductThumb({
  categoryId,
  icon,
  color,
  image,
  alt = '',
  fit,
  size = 'lg',
  className,
}: ProductThumbProps) {
  const visual = getCategoryVisual(categoryId, { icon, color })
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
        visual.color.tone,
        size === 'lg' ? 'aspect-[4/3] w-full rounded-lg' : 'size-12 rounded-lg',
        className,
      )}
    >
      {!loaded && (
        <Icon
          className={cn(size === 'lg' ? 'size-10 drop-shadow-sm' : 'size-5', hasImage && 'animate-pulse opacity-60')}
          strokeWidth={1.75}
        />
      )}

      {hasImage && (
        <>
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
