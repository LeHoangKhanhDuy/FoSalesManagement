import { useState } from 'react'
import { ImagePlus, Link2, LoaderCircle, RefreshCw, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Field, inputClass } from '@/components/ui/FormField'
import { DashedBorder, ImageDropzone } from '@/components/ui/ImageDropzone'
import { cn } from '@/lib/cn'
import { dataUrlSize, isDataUrl } from '@/lib/image'
import { productsService } from '@/modules/products/services/products.service'
import type { ProductFormErrors, ProductFormValues } from '@/modules/products/types/products.types'
import type { SetProductField } from '@/modules/products/hooks/useProductForm'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { ImageFit } from '@/modules/sales/types/sales.types'

const FIT_OPTIONS: { value: ImageFit; label: string }[] = [
  { value: 'auto', label: 'Tự động' },
  { value: 'cover', label: 'Lấp đầy' },
  { value: 'contain', label: 'Hiện trọn' },
]

interface ProductImageFieldProps {
  values: ProductFormValues
  errors: ProductFormErrors
  set: SetProductField
}

export function ProductImageField({ values, errors, set }: ProductImageFieldProps) {
  const [uploading, setUploading] = useState(false)
  const image = values.image.trim()
  const uploaded = isDataUrl(image)

  const upload = async (file: File) => {
    setUploading(true)
    try {
      set('image', await productsService.uploadImage(file))
      toast.success('Đã tải ảnh lên')
    } catch {
      toast.error('Tải ảnh thất bại, vui lòng thử lại')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex gap-4">
      <ImageDropzone onFile={upload} onError={(m) => toast.error(m)} disabled={uploading} className="group w-44 shrink-0 rounded-lg">
        {({ dragging }) => (
          <div
            className={cn(
              'relative aspect-[4/3] w-full overflow-hidden rounded-lg transition',
              !image && 'bg-slate-50 group-hover:bg-primary-50/40',
              dragging && 'bg-primary-50 ring-4 ring-primary-100',
            )}
          >
            {image && values.categoryId && (
              <ProductThumb key={image} categoryId={values.categoryId} image={image} fit={values.imageFit} alt={values.name} />
            )}
            {image && !values.categoryId && <img src={image} alt="" className="size-full object-contain" />}

            {(!image || dragging) && (
              <DashedBorder
                animated={dragging}
                className={cn(
                  'z-10 transition-colors',
                  dragging ? 'text-primary-500' : 'text-slate-300 group-hover:text-primary-400',
                )}
              />
            )}

            {!image && !dragging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center">
                <span className="grid size-9 place-items-center rounded-full bg-white text-primary-600 shadow-sm">
                  <ImagePlus className="size-[18px]" />
                </span>
                <p className="text-xs font-semibold text-slate-700">Kéo thả hoặc bấm để chọn</p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP · tối đa 5MB</p>
              </div>
            )}

            {image && !dragging && !uploading && (
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-900/45 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-semibold text-slate-800">
                  <RefreshCw className="size-3.5" /> Đổi ảnh
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    set('image', '')
                  }}
                  className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white text-rose-500 hover:bg-rose-50"
                  aria-label="Xóa ảnh"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}

            {dragging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-primary-50/90 text-primary-700">
                <Upload className="size-6 animate-bounce" />
                <p className="text-xs font-bold">Thả ảnh vào đây</p>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/80 text-primary-700">
                <LoaderCircle className="size-6 animate-spin" />
                <p className="text-xs font-semibold">Đang tải lên...</p>
              </div>
            )}
          </div>
        )}
      </ImageDropzone>

      <div className="min-w-0 flex-1 space-y-3">
        {uploaded ? (
          <Field label="Ảnh sản phẩm">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-primary-100 bg-primary-50/60 px-3 text-sm">
              <ImagePlus className="size-4 shrink-0 text-primary-600" />
              <span className="min-w-0 flex-1 truncate font-medium text-primary-800">
                Ảnh đã tải lên · {Math.max(1, Math.round(dataUrlSize(image) / 1024))} KB
              </span>
              <button
                type="button"
                onClick={() => set('image', '')}
                className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-rose-500"
              >
                Gỡ ảnh
              </button>
            </div>
          </Field>
        ) : (
          <Field label="Hoặc dán đường dẫn ảnh" error={errors.image}>
            <div className="relative">
              <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={values.image}
                onChange={(e) => set('image', e.target.value)}
                placeholder="https://... hoặc /products/ten-anh.png"
                className={cn(inputClass(errors.image), 'pl-9')}
              />
            </div>
          </Field>
        )}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-700">Cách hiển thị ảnh</p>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {FIT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set('imageFit', o.value)}
                className={cn(
                  'h-7 cursor-pointer rounded-md px-3 text-xs font-semibold transition',
                  values.imageFit === o.value ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
