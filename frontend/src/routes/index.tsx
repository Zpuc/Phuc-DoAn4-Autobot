import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { HomePage } from '../pages/public/HomePage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ProductListPage } from '../pages/public/ProductListPage';
import { ProductDetailPage } from '../pages/public/ProductDetailPage';
import { CartPage } from '../pages/public/CartPage';
import { CheckoutPage } from '../pages/public/CheckoutPage';
import { TrackOrderPage } from '../pages/public/TrackOrderPage';
import { QuotationPage } from '../pages/public/QuotationPage';
import { MyOrdersPage } from '../pages/public/MyOrdersPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { ProductManagePage } from '../pages/admin/ProductManagePage';
import { InventoryManagePage } from '../pages/admin/InventoryManagePage';
import { OrderManagePage } from '../pages/admin/OrderManagePage';
import { QuotationManagePage } from '../pages/admin/QuotationManagePage';
import { ReportsPage } from '../pages/admin/ReportsPage';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'quotations', element: <QuotationPage /> },
      { path: 'my-orders', element: <MyOrdersPage /> },
    ],
  },

  // Admin Routes (Yêu cầu đăng nhập & role ADMIN hoặc STAFF)
  {
    path: '/admin',
    element: <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <ProductManagePage /> },
          { path: 'inventory', element: <InventoryManagePage /> },
          { path: 'orders', element: <OrderManagePage /> },
          { path: 'quotations', element: <QuotationManagePage /> },
          { path: 'reports', element: <ReportsPage /> },
        ],
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
