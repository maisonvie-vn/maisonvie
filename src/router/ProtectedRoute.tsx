import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F5EE]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#C89A3D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-light text-sm">
            Đang tải cấu hình an toàn...
          </p>
        </div>
      </div>
    );
  }

  // 1. If not authenticated, redirect to /login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If role is not yet loaded, wait
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F5EE]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#C89A3D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-light text-sm">
            Đang xác thực vai trò...
          </p>
        </div>
      </div>
    );
  }

  // 3. If roles are restricted and user role is not allowed, redirect to safe route
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Accountant goes to /payments by default, others go to /dashboard
    const defaultRedirect = role === "accountant" ? "/payments" : "/dashboard";
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};
