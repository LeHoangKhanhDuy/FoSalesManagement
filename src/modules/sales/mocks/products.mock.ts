import type { Product } from '@/modules/sales/types/sales.types'

let seq = 0
const p = (data: Omit<Product, 'id' | 'sku' | 'barcode'>): Product => {
  seq += 1
  const n = String(seq).padStart(4, '0')
  return { id: `p-${n}`, sku: `SP${n}`, barcode: `893${String(1000000000 + seq * 7919).slice(0, 10)}`, ...data }
}

export const MOCK_PRODUCTS: Product[] = [
  // Đồ uống
  p({ name: 'Coca-Cola lon 330ml', categoryId: 'drinks', price: 10000, unit: 'Lon', stock: 148, isBestSeller: true }),
  p({ name: 'Trà xanh Không Độ 455ml', categoryId: 'drinks', price: 10000, unit: 'Chai', stock: 96 }),
  p({ name: 'Nước suối Aquafina 500ml', categoryId: 'drinks', price: 6000, unit: 'Chai', stock: 240, isBestSeller: true }),
  p({ name: 'Nước tăng lực Red Bull 250ml', categoryId: 'drinks', price: 12000, unit: 'Lon', stock: 72 }),
  p({ name: 'Cà phê sữa đá lon 235ml', categoryId: 'drinks', price: 18000, originalPrice: 22000, unit: 'Lon', stock: 35 }),
  p({ name: 'Trà sữa Oolong chai 450ml', categoryId: 'drinks', price: 15000, unit: 'Chai', stock: 4 }),
  // Bánh kẹo
  p({ name: 'Bánh quy Oreo vani 133g', categoryId: 'snacks', price: 18000, unit: 'Gói', stock: 60 }),
  p({ name: 'Snack khoai tây vị tảo biển', categoryId: 'snacks', price: 12000, unit: 'Gói', stock: 88, isBestSeller: true }),
  p({ name: 'Bánh Chocopie hộp 12 cái', categoryId: 'snacks', price: 52000, originalPrice: 58000, unit: 'Hộp', stock: 24 }),
  p({ name: 'Kẹo trái cây hũ 200g', categoryId: 'snacks', price: 25000, unit: 'Hũ', stock: 0 }),
  // Sữa
  p({ name: 'Sữa tươi tiệt trùng 1L', categoryId: 'dairy', price: 36000, unit: 'Hộp', stock: 54, isBestSeller: true }),
  p({ name: 'Sữa chua ăn có đường lốc 4', categoryId: 'dairy', price: 28000, unit: 'Lốc', stock: 40 }),
  p({ name: 'Sữa tươi ít đường 180ml lốc 4', categoryId: 'dairy', price: 34000, unit: 'Lốc', stock: 66 }),
  p({ name: 'Phô mai con bò cười 8 miếng', categoryId: 'dairy', price: 42000, unit: 'Hộp', stock: 8 }),
  // Mì & đồ khô
  p({ name: 'Mì tôm chua cay gói 75g', categoryId: 'instant', price: 4500, unit: 'Gói', stock: 420, isBestSeller: true }),
  p({ name: 'Mì khoai tây sốt bò hầm', categoryId: 'instant', price: 9000, unit: 'Gói', stock: 130 }),
  p({ name: 'Phở bò ăn liền 65g', categoryId: 'instant', price: 12000, unit: 'Gói', stock: 75 }),
  p({ name: 'Gạo ST25 túi 5kg', categoryId: 'instant', price: 185000, originalPrice: 199000, unit: 'Túi', stock: 18 }),
  // Trái cây
  p({ name: 'Táo Envy New Zealand', categoryId: 'fruit', price: 129000, unit: 'Kg', stock: 22 }),
  p({ name: 'Chuối già Nam Mỹ', categoryId: 'fruit', price: 32000, unit: 'Kg', stock: 30 }),
  p({ name: 'Nho xanh không hạt', categoryId: 'fruit', price: 159000, unit: 'Kg', stock: 3 }),
  // Chăm sóc cá nhân
  p({ name: 'Dầu gội sạch gàu 630g', categoryId: 'personal', price: 179000, unit: 'Chai', stock: 14 }),
  p({ name: 'Kem đánh răng bảo vệ 230g', categoryId: 'personal', price: 32000, unit: 'Tuýp', stock: 50 }),
  p({ name: 'Sữa tắm kháng khuẩn 850g', categoryId: 'personal', price: 145000, unit: 'Chai', stock: 11 }),
  // Gia dụng
  p({ name: 'Nước rửa chén hương chanh 750g', categoryId: 'household', price: 38000, unit: 'Chai', stock: 44 }),
  p({ name: 'Giấy vệ sinh 3 lớp 10 cuộn', categoryId: 'household', price: 89000, unit: 'Lốc', stock: 26 }),
  p({ name: 'Bột giặt hương nắng mai 3kg', categoryId: 'household', price: 168000, originalPrice: 185000, unit: 'Túi', stock: 0 }),
  p({ name: 'Túi rác tự hủy 3 cuộn', categoryId: 'household', price: 29000, unit: 'Lốc', stock: 63 }),
]
