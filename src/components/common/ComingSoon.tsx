import { Link, useLocation } from 'react-router-dom'
import { Hammer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { findNavItem } from '@/config/navigation'
import { PATHS } from '@/routes/paths'

export function ComingSoon() {
  const { pathname } = useLocation()
  const nav = findNavItem(pathname)
  return (
    <Card className="grid min-h-[60vh] place-items-center">
      <EmptyState
        icon={<Hammer />}
        title={`${nav?.item.label ?? 'Trang'} đang được phát triển`}
        description="Tính năng này sẽ sớm ra mắt. Trong lúc chờ, bạn có thể bắt đầu bán hàng tại màn hình POS."
        action={
          <Link to={PATHS.pos}>
            <Button>Đi tới Bán hàng</Button>
          </Link>
        }
      />
    </Card>
  )
}
