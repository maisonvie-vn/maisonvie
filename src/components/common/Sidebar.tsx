import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

export const Sidebar: React.FC = () => {
  const { profile, role, signOut } = useAuth();

  const getMenuItems = () => {
    const items = [
      {
        path: "/dashboard",
        label: "Tổng quan",
        roles: ["admin", "team_lead", "sales"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
            />
          </svg>
        ),
      },
      {
        path: "/opportunities",
        label: "Cơ hội (Kanban)",
        roles: ["admin", "team_lead", "sales"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
      },
      {
        path: "/tasks",
        label: "Công việc",
        roles: ["admin", "team_lead", "sales"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        ),
      },
      {
        path: "/leads",
        label: "Khách hàng",
        roles: ["admin", "team_lead", "sales", "accountant"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
      {
        path: "/payments",
        label: "Thanh toán",
        roles: ["admin", "team_lead", "sales", "accountant"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M3 12l1.9-5.7a2 2 0 011.9-1.3h10.4a2 2 0 011.9 1.3L21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"
            />
          </svg>
        ),
      },
      {
        path: "/settings",
        label: "Cài đặt",
        roles: ["admin"],
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
      },
    ];

    if (!role) return [];
    return items.filter((item) => item.roles.includes(role));
  };

  const getRoleLabel = (r: string | null) => {
    switch (r) {
      case "admin":
        return "Quản trị viên";
      case "team_lead":
        return "Trưởng nhóm";
      case "sales":
        return "Nhân viên Sales";
      case "accountant":
        return "Kế toán";
      default:
        return "Nhân viên";
    }
  };

  return (
    <aside className="w-[240px] h-screen glass-sidebar flex flex-col justify-between p-6 fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#C89A3D] rounded-xl flex items-center justify-center text-white shadow-sm font-semibold tracking-wider">
            YVH
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-medium tracking-tight text-[#1A1A1A]">
              Vĩnh Hưng CRM
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-light">
              Yến Sào Cao Cấp
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col space-y-1.5">
          {getMenuItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "relative flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-light transition-all duration-200",
                  isActive
                    ? "bg-[#C89A3D]/8 text-[#C89A3D] font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left dot indicator when active */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#C89A3D] rounded-full" />
                  )}
                  <span
                    className={clsx(
                      isActive ? "text-[#C89A3D]" : "text-gray-400",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="space-y-4 pt-4 border-t border-gray-100/50">
        <div className="flex items-center space-x-3 px-2">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-[#C89A3D]/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#C89A3D]/10 text-[#C89A3D] flex items-center justify-center font-medium text-sm">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
          )}
          <div className="leading-tight overflow-hidden">
            <h4 className="text-xs font-medium text-gray-800 truncate">
              {profile?.full_name || "Đang tải..."}
            </h4>
            <p className="text-[10px] text-gray-400 font-light truncate">
              {getRoleLabel(role)}
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-light text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
