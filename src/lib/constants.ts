export const APP_NAME = 'FoSales'
export const APP_SUBTITLE = 'FoTech Sales Management'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
/** true khi chưa có BE -> service dùng mock data */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false' || !API_BASE_URL
export const VAT_RATE = 0.08
