import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../lib/supabase/dashboard";
import { formatVND, formatDate } from "../lib/utils/format";
import GlassCard from "../components/common/GlassCard";
import Skeleton from "../components/common/Skeleton";
import Badge from "../components/common/Badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Dashboard: React.FC = () => {
  const { profile, role } = useAuth();
  const orgId = profile?.organization_id || "";
  const userId = profile?.id || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardStats", orgId, userId, role],
    queryFn: () =>
      getDashboardStats({ orgId, userId, userRole: role || "sales" }),
    enabled: !!orgId,
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="high">Cao</Badge>;
      case "medium":
        return <Badge variant="medium">Trung bình</Badge>;
      default:
        return <Badge variant="low">Thấp</Badge>;
    }
  };

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case "vip":
        return <Badge variant="vip">VIP</Badge>;
      case "agency":
        return <Badge variant="agency">Đại lý</Badge>;
      default:
        return <Badge variant="retail">Khách lẻ</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton variant="text" className="h-4 w-1/3" />
                <Skeleton variant="text" className="h-8 w-2/3" />
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Charts & Table skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <Skeleton variant="rect" className="h-[300px] w-full" />
          </GlassCard>
          <GlassCard className="p-6">
            <Skeleton variant="rect" className="h-[300px] w-full" />
          </GlassCard>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center glass-panel rounded-2xl">
        <p className="text-red-500 font-light">
          Không thể tải thông tin thống kê hoạt động.
        </p>
      </div>
    );
  }

  const { metrics, recentOpportunities, todayTasks, stageDistribution } = data;

  return (
    <div className="space-y-8">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        {/* Metric 1 */}
        <GlassCard className="relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-light uppercase tracking-wider">
              Khách mới (7 ngày)
            </p>
            <h3 className="text-3xl font-medium text-[#1A1A1A]">
              {metrics.newLeads}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 text-[#C89A3D]/10 group-hover:text-[#C89A3D]/25 transition-colors">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        </GlassCard>

        {/* Metric 2 */}
        <GlassCard className="relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-light uppercase tracking-wider">
              Cơ hội đang mở
            </p>
            <h3 className="text-3xl font-medium text-[#1A1A1A]">
              {metrics.openOpportunities}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 text-[#C89A3D]/10 group-hover:text-[#C89A3D]/25 transition-colors">
            <svg
              className="w-12 h-12"
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
          </div>
        </GlassCard>

        {/* Metric 3 */}
        <GlassCard className="relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-light uppercase tracking-wider">
              Giá trị Pipeline
            </p>
            <h3 className="text-2xl font-medium text-[#C89A3D] truncate">
              {formatVND(metrics.pipelineValue)}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 text-[#C89A3D]/10 group-hover:text-[#C89A3D]/25 transition-colors">
            <svg
              className="w-12 h-12"
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
          </div>
        </GlassCard>

        {/* Metric 4 */}
        <GlassCard className="relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-light uppercase tracking-wider">
              Doanh thu tháng này
            </p>
            <h3 className="text-2xl font-medium text-emerald-600 truncate">
              {formatVND(metrics.monthlyRevenue)}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 text-[#C89A3D]/10 group-hover:text-[#C89A3D]/25 transition-colors">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </GlassCard>
      </div>

      {/* Charts & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-800">
              Biểu đồ Đường ống Cơ hội theo Giai đoạn
            </h4>
            <p className="text-xs text-gray-400 font-light">
              Số lượng cơ hội và tổng giá trị phân phối trong từng giai đoạn
              phễu
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EFEAE0"
                />
                <XAxis
                  dataKey="name"
                  stroke="#706A60"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#706A60" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(200, 154, 61, 0.04)" }}
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(200, 154, 61, 0.15)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 8px 32px 0 rgba(200, 154, 61, 0.05)",
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "value") return [formatVND(value), "Giá trị"];
                    return [value, "Cơ hội"];
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#C89A3D"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Today's Tasks List */}
        <GlassCard className="p-6 flex flex-col space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-800">
              Nhiệm vụ trong ngày
            </h4>
            <p className="text-xs text-gray-400 font-light">
              Công việc quá hạn hoặc cần hoàn thành trước cuối ngày
            </p>
          </div>

          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto no-scrollbar max-h-[280px]">
            {todayTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-gray-400 font-light">
                  Bạn đã hoàn tất mọi công việc hôm nay!
                </p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-white/40 rounded-xl border border-white/50 flex justify-between items-start space-x-3 transition-colors hover:bg-white/70"
                >
                  <div className="space-y-1 overflow-hidden">
                    <h5 className="text-xs font-medium text-gray-700 truncate leading-none">
                      {task.title}
                    </h5>
                    <p className="text-[10px] text-gray-400 truncate">
                      KH: {task.leads?.full_name || "Vãng lai"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recent Opportunities Grid */}
      <GlassCard className="p-6 space-y-6">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-gray-800">
            Cơ hội kinh doanh mới cập nhật
          </h4>
          <p className="text-xs text-gray-400 font-light">
            Danh sách các cơ hội bán hàng vừa được tạo hoặc cập nhật trạng thái
            gần nhất
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-left text-xs font-light">
            <thead className="bg-[#F9F5EE]/80 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 rounded-l-xl">Cơ hội</th>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Số điện thoại</th>
                <th className="px-5 py-3">Phân khúc</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3 rounded-r-xl text-right">
                  Giá trị tạm tính
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50 bg-white/10">
              {recentOpportunities.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-gray-400 font-light"
                  >
                    Chưa ghi nhận cơ hội kinh doanh nào.
                  </td>
                </tr>
              ) : (
                recentOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    className="transition-colors hover:bg-white/40"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {opp.title}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {opp.leads?.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono">
                      {opp.leads?.phone_primary}
                    </td>
                    <td className="px-5 py-3.5">
                      {getSegmentBadge(opp.leads?.segment)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {formatDate(opp.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-[#C89A3D]">
                      {formatVND(opp.value)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
export default Dashboard;
