import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { HomePage } from '../pages/public/HomePage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ProductListPage } from '../pages/public/ProductListPage';
import { ProductDetailPage } from '../pages/public/ProductDetailPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { ProductManagePage } from '../pages/admin/ProductManagePage';

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
      { path: 'quotations', element: <HomePage /> },
      { path: 'cart', element: <HomePage /> },
      { path: 'track-order', element: <HomePage /> },
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
          { path: 'inventory', element: <ProductManagePage /> },
          { path: 'orders', element: <DashboardPage /> },
          { path: 'quotations', element: <DashboardPage /> },
          { path: 'reports', element: <DashboardPage /> },
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
