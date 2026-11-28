import { useQuery } from '@/hooks/useQuery'
import type { OrderDetail } from '@/modules/orders/types/orders.types'
import { productsService } from '@/modules/products/services/products.service'

const BATCH_SIZE = 50

async function loadImages(ids: string[]) {
  const requests = []
  for (let offset = 0; offset < ids.length; offset += BATCH_SIZE) {
    const batch = ids.slice(offset, offset + BATCH_SIZE)
    requests.push(productsService.options({ ids: batch, limit: batch.length }))
  }

  const images = new Map<string, string>()
  for (const result of await Promise.allSettled(requests)) {
    if (result.status === 'fulfilled') {
      for (const product of result.value) {
        if (product.image) images.set(product.id, product.image)
      }
    }
  }
  return images
}

export function useOrderProductImages(order: OrderDetail | null | undefined) {
  const ids = new Set(order?.lines.filter((line) => !line.image && line.productId).map((line) => line.productId))
  return useQuery(loadImages, [...ids], { enabled: ids.size > 0 }).data
}
