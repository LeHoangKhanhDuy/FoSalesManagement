import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { ComingSoon } from '@/components/common/ComingSoon'
import { MainLayout } from '@/components/layout/MainLayout'
import { PATHS } from '@/routes/paths'

const SalesPage = lazy(() => import('@/modules/sales/pages/SalesPage'))
const OrdersPage = lazy(() => import('@/modules/orders/pages/OrdersPage'))
const ProductsPage = lazy(() => import('@/modules/products/pages/ProductsPage'))
const CategoriesPage = lazy(() => import('@/modules/categories/pages/CategoriesPage'))
const InventoryPage = lazy(() => import('@/modules/inventory/pages/InventoryPage'))
const SuppliersPage = lazy(() => import('@/modules/suppliers/pages/SuppliersPage'))
const PromotionsPage = lazy(() => import('@/modules/promotions/pages/PromotionsPage'))
const CustomersPage = lazy(() => import('@/modules/customers/pages/CustomersPage'))

const Loadable = ({ children }: { children: ReactNode }) => (
  <Suspense
    fallback={
      <div className="grid flex-1 place-items-center py-20">
        <LoaderCircle className="size-8 animate-spin text-primary-600" />
      </div>
    }
  >
    {children}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: PATHS.home, element: <Navigate to={PATHS.pos} replace /> },
      {
        path: PATHS.pos,
        element: (
          <Loadable>
            <SalesPage />
          </Loadable>
        ),
      },
      {
        path: PATHS.orders,
        element: (
          <Loadable>
            <OrdersPage />
          </Loadable>
        ),
      },
      {
        path: PATHS.products,
        element: (
          <Loadable>
            <ProductsPage />
          </Loadable>
        ),
      },
      {
        path: PATHS.categories,
        element: (
          <Loadable>
            <CategoriesPage />
          </Loadable>
        ),
      },
      {
        path: PATHS.inventory,
        element: (
          <Loadable>
            <InventoryPage />
          </Loadable>
        ),
      },
      {
        path: PATHS.suppliers,
        element: (
          <Loadable>
            <SuppliersPage />
          </Loadable>
        ),
      },
      {
        path: PATHS.promotions,
        element: (
          <Loadable>
            <PromotionsPage />
          </Loadable>
        ),
      },
      {
        path: PATHS.customers,
        element: (
          <Loadable>
            <CustomersPage />
          </Loadable>
        ),
      },
      { path: '*', element: <ComingSoon /> },
    ],
  },
])
