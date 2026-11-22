export const IMAGE_ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export const validateImageFile = (file: File, maxSizeMB = 5) => {
  if (!IMAGE_ACCEPT.includes(file.type)) return 'Chỉ hỗ trợ ảnh PNG, JPG, WEBP hoặc GIF'
  if (file.size > maxSizeMB * 1024 * 1024) return `Ảnh vượt quá ${maxSizeMB}MB`
  return null
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Không đọc được ảnh'))
    img.src = src
  })

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Không đọc được ảnh'))
    reader.readAsDataURL(file)
  })

export const compressImage = async (file: File, maxSize = 800, quality = 0.85): Promise<string> => {
  const original = await readAsDataUrl(file)
  if (file.type === 'image/gif') return original
  const img = await loadImage(original)
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
  const result = canvas.toDataURL('image/webp', quality)
  return result.length < original.length ? result : original
}

export const isDataUrl = (src: string) => src.startsWith('data:image/')

export const dataUrlSize = (src: string) => Math.round(((src.length - src.indexOf(',') - 1) * 3) / 4)
