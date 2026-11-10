import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Result, Button } from 'antd';

interface ProtectedRouteProps {
  requiredRoles?: ('ADMIN' | 'CUSTOMER')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="403 - Không có quyền truy cập"
        subTitle="Tài khoản của bạn không có quyền truy cập vào khu vực này."
        extra={
          <Button type="primary" href="/">
            Quay lại Trang Chủ
          </Button>
        }
      />
    );
  }

  return <Outlet />;
};

