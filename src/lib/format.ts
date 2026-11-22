const currencyFormatter = new Intl.NumberFormat('vi-VN')

export const formatCurrency = (value: number) => `${currencyFormatter.format(Math.round(value))}đ`

export const formatNumber = (value: number) => currencyFormatter.format(value)

export const parseNumber = (value: string) => Number(value.replace(/[^\d]/g, '')) || 0

export const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}tỷ`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}tr`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)

export const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)

export const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

export const removeAccents = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
