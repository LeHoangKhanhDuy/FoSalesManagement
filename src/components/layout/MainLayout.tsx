import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { PageBar } from '@/components/layout/PageBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { useQuery } from '@/hooks/useQuery'
import { storesService } from '@/modules/stores/services/stores.service'

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const store = useQuery(storesService.current, null, { errorText: 'Không tải được thông tin cửa hàng' })

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header store={store.data} storeLoading={store.loading} onOpenMenu={() => setMobileOpen(true)} />
        <PageBar />
        <main className="flex min-h-0 flex-1 flex-col px-4 pb-6 lg:px-6">
          <Outlet context={{ store: store.data, error: store.error, reload: store.reload, onSaved: store.setData }} />
        </main>
      </div>
    </div>
  )
}
