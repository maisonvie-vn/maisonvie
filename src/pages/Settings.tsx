import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase/client";
import { formatDateTime } from "../lib/utils/format";
import GlassCard from "../components/common/GlassCard";
import Skeleton from "../components/common/Skeleton";
import Badge from "../components/common/Badge";

export const Settings: React.FC = () => {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<"roles" | "audit">("roles");

  // Fetch Audit Logs Query (Only for Admin)
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    },
    enabled: activeTab === "audit" && !!profile?.id,
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h3 className="text-xl font-medium text-gray-800">Cấu hình Hệ thống</h3>
        <p className="text-xs text-gray-400 font-light">
          Quản trị chi tiết vai trò nhân sự, thành viên đội nhóm và giám sát
          lịch sử truy xuất hệ thống.
        </p>
      </div>

      {/* Tabs selectors */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-5 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px outline-none ${
            activeTab === "roles"
              ? "border-[#C89A3D] text-[#C89A3D]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          Đội nhóm & Vai trò
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-5 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px outline-none ${
            activeTab === "audit"
              ? "border-[#C89A3D] text-[#C89A3D]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          Nhật ký Hoạt động (Audit Logs)
        </button>
      </div>

      {/* Tab 1: Roles and Teams */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Card 1 */}
          <GlassCard className="space-y-5">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-800">
                Đội nhóm Sales hoạt động
              </h4>
              <p className="text-xs text-gray-400 font-light">
                Phân chia khách hàng tiềm năng theo từng nhóm khu vực bán hàng.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white/40 rounded-xl border border-white/50 flex justify-between items-center">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-medium text-gray-700 leading-none">
                    Nhóm Yến Sào Miền Bắc
                  </h5>
                  <span className="text-[10px] text-gray-400 font-light">
                    Trưởng nhóm: Nguyễn Văn Nam
                  </span>
                </div>
                <Badge variant="vip">4 Reps</Badge>
              </div>

              <div className="p-3.5 bg-white/40 rounded-xl border border-white/50 flex justify-between items-center">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-medium text-gray-700 leading-none">
                    Nhóm Yến Sào Miền Nam
                  </h5>
                  <span className="text-[10px] text-gray-400 font-light">
                    Trưởng nhóm: Trần Thị Hương
                  </span>
                </div>
                <Badge variant="vip">5 Reps</Badge>
              </div>
            </div>
          </GlassCard>

          {/* Card 2 */}
          <GlassCard className="space-y-5">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-800">
                Ma trận Phân quyền Vai trò (RBAC)
              </h4>
              <p className="text-xs text-gray-400 font-light">
                Chính sách bảo mật RLS được tự động phân quyền theo vai trò nhân
                viên.
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600 font-light leading-relaxed">
              <div className="flex justify-between items-center border-b border-gray-100/50 pb-2">
                <span className="font-medium text-gray-700">
                  Quản trị viên (Admin)
                </span>
                <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                  Toàn quyền hệ thống
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100/50 pb-2">
                <span className="font-medium text-gray-700">
                  Trưởng nhóm (Team Lead)
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                  Quản lý đội ngũ
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100/50 pb-2">
                <span className="font-medium text-gray-700">
                  Nhân viên Sales
                </span>
                <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-100">
                  Chỉ xem khách hàng của mình
                </span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-medium text-gray-700">
                  Kế toán (Accountant)
                </span>
                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                  Đối soát Tài chính
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === "audit" && (
        <GlassCard className="p-6 space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-800">
              Nhật ký Giám sát Hệ thống
            </h4>
            <p className="text-xs text-gray-400 font-light">
              Ghi nhận append-only mọi hành động cập nhật, xóa, sửa đổi dữ liệu
              quan trọng của nhân viên. Không thể xóa sửa.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full text-left text-xs font-light">
              <thead className="bg-[#F9F5EE]/80 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 rounded-l-xl">Thời gian</th>
                  <th className="px-5 py-3">Nhân sự</th>
                  <th className="px-5 py-3">Hành động</th>
                  <th className="px-5 py-3">Đối tượng</th>
                  <th className="px-5 py-3 rounded-r-xl">Mã đối tượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/10">
                {auditLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-3">
                        <Skeleton variant="text" className="h-4 w-3/4" />
                      </td>
                    </tr>
                  ))
                ) : auditLogs?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-gray-400 font-light"
                    >
                      Chưa ghi nhận hoạt động nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  auditLogs?.map((log: any) => (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-white/40"
                    >
                      <td className="px-5 py-3 text-gray-400">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-700">
                        {log.user_id}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                            log.action.includes("delete") ||
                            log.action.includes("remove")
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : log.action.includes("insert") ||
                                  log.action.includes("create")
                                ? "bg-green-50 text-green-600 border border-green-100"
                                : "bg-sky-50 text-sky-600 border border-sky-100"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono">
                        {log.entity_name || "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-400 font-mono">
                        {log.entity_id || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
export default Settings;
