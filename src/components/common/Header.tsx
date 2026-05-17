import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Header: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/dashboard":
        return "Tổng quan hoạt động";
      case "/opportunities":
        return "Đường ống Cơ hội (Kanban)";
      case "/tasks":
        return "Nhiệm vụ & Công việc";
      case "/leads":
        return "Hồ sơ Khách hàng";
      case "/payments":
        return "Đối soát Thanh toán";
      case "/settings":
        return "Cấu hình Hệ thống";
      default:
        return "Hệ thống CRM";
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/30 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h2 className="text-base font-medium text-gray-800">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Info & Status */}
      <div className="flex items-center space-x-6">
        {profile?.organization_id && (
          <div className="flex items-center space-x-2 text-xs font-light text-gray-500 bg-white/60 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#C89A3D] rounded-full animate-pulse" />
            <span>Chi nhánh chính</span>
          </div>
        )}

        {/* Date Display */}
        <div className="text-xs font-light text-gray-400">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </header>
  );
};
export default Header;
