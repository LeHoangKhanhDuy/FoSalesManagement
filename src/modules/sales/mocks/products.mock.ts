import type { Product } from '@/modules/sales/types/sales.types'

let seq = 0
const p = (data: Omit<Product, 'id' | 'sku'>): Product => {
  seq += 1
  const n = String(seq).padStart(4, '0')
  return {
    id: `p-${n}`,
    sku: `SP${n}`,
    costPrice: Math.round((data.price * (0.68 + ((seq * 7) % 13) / 100)) / 100) * 100,
    status: 'active',
    createdAt: new Date(Date.UTC(2026, 8, 1 + seq * 2, 3)).toISOString(),
    ...data,
  }
}

export const MOCK_PRODUCTS: Product[] = [
  p({ barcode: '8934588101373', name: 'Coca-Cola lon 330ml', categoryId: 'drinks', price: 10000, unit: 'Lon', stock: 148, isBestSeller: true }),
  p({ barcode: '8934588102745', name: 'Trà xanh Không Độ 455ml', categoryId: 'drinks', price: 10000, unit: 'Chai', stock: 96 }),
  p({ barcode: '8934588104114', name: 'Nước suối Aquafina 500ml', categoryId: 'drinks', price: 6000, unit: 'Chai', stock: 240, isBestSeller: true }),
  p({ barcode: '8934588105487', name: 'Nước tăng lực Red Bull 250ml', categoryId: 'drinks', price: 12000, unit: 'Lon', stock: 72 }),
  p({ barcode: '8934588106859', name: 'Cà phê sữa đá lon 235ml', categoryId: 'drinks', price: 18000, originalPrice: 22000, unit: 'Lon', stock: 35 }),
  p({ barcode: '8934588108228', name: 'Trà sữa Oolong chai 450ml', categoryId: 'drinks', price: 15000, unit: 'Chai', stock: 4, status: 'inactive' }),
  p({ barcode: '8936036101379', name: 'Bánh quy Oreo vani 133g', categoryId: 'snacks', price: 18000, unit: 'Gói', stock: 60 }),
  p({ barcode: '8936036102741', name: 'Snack khoai tây vị tảo biển', categoryId: 'snacks', price: 12000, unit: 'Gói', stock: 88, isBestSeller: true }),
  p({ barcode: '8936036104110', name: 'Bánh Chocopie hộp 12 cái', categoryId: 'snacks', price: 52000, originalPrice: 58000, unit: 'Hộp', stock: 24 }),
  p({ barcode: '8936036105483', name: 'Kẹo trái cây hũ 200g', categoryId: 'snacks', price: 25000, unit: 'Hũ', stock: 0 }),
  p({ barcode: '8934673101370', name: 'Sữa tươi tiệt trùng 1L', categoryId: 'dairy', price: 36000, unit: 'Hộp', stock: 54, isBestSeller: true }),
  p({ barcode: '8934673102742', name: 'Sữa chua ăn có đường lốc 4', categoryId: 'dairy', price: 28000, unit: 'Lốc', stock: 40 }),
  p({ barcode: '8934673104111', name: 'Sữa tươi ít đường 180ml lốc 4', categoryId: 'dairy', price: 34000, unit: 'Lốc', stock: 66 }),
  p({ barcode: '8934673105484', name: 'Phô mai con bò cười 8 miếng', categoryId: 'dairy', price: 42000, unit: 'Hộp', stock: 8 }),
  p({ barcode: '8934563101374', name: 'Mì tôm chua cay gói 75g', categoryId: 'instant', price: 4500, unit: 'Gói', stock: 420, isBestSeller: true }),
  p({ barcode: '8934563102746', name: 'Mì khoai tây sốt bò hầm', categoryId: 'instant', price: 9000, unit: 'Gói', stock: 130 }),
  p({ barcode: '8934563104115', name: 'Phở bò ăn liền 65g', categoryId: 'instant', price: 12000, unit: 'Gói', stock: 75 }),
  p({ barcode: '8934563105488', name: 'Gạo ST25 túi 5kg', categoryId: 'instant', price: 185000, originalPrice: 199000, unit: 'Túi', stock: 18 }),
  p({ barcode: '8936017101374', name: 'Táo Envy New Zealand', categoryId: 'fruit', price: 129000, unit: 'Kg', stock: 22 }),
  p({ barcode: '8936017102746', name: 'Chuối già Nam Mỹ', categoryId: 'fruit', price: 32000, unit: 'Kg', stock: 30 }),
  p({ barcode: '8936017104115', name: 'Nho xanh không hạt', categoryId: 'fruit', price: 159000, unit: 'Kg', stock: 3 }),
  p({ barcode: '8934868101376', name: 'Dầu gội sạch gàu 630g', categoryId: 'personal', price: 179000, unit: 'Chai', stock: 14 }),
  p({ barcode: '8934868102748', name: 'Kem đánh răng bảo vệ 230g', categoryId: 'personal', price: 32000, unit: 'Tuýp', stock: 50 }),
  p({ barcode: '8934868104117', name: 'Sữa tắm kháng khuẩn 850g', categoryId: 'personal', price: 145000, unit: 'Chai', stock: 11 }),
  p({ barcode: '8935049101376', name: 'Nước rửa chén hương chanh 750g', categoryId: 'household', price: 38000, unit: 'Chai', stock: 44 }),
  p({ barcode: '8935049102748', name: 'Giấy vệ sinh 3 lớp 10 cuộn', categoryId: 'household', price: 89000, unit: 'Lốc', stock: 26 }),
  p({ barcode: '8935049104117', name: 'Bột giặt hương nắng mai 3kg', categoryId: 'household', price: 168000, originalPrice: 185000, unit: 'Túi', stock: 0 }),
  p({ barcode: '8935049105480', name: 'Túi rác tự hủy 3 cuộn', categoryId: 'household', price: 29000, unit: 'Lốc', stock: 63, status: 'inactive' }),
  p({ barcode: '4897036691342', name: 'Sản phẩm thử máy quét', categoryId: 'snacks', price: 25000, unit: 'Cái', stock: 30 }),
]
