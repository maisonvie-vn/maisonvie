import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  getPayments,
  createPayment,
  updatePayment,
} from "../lib/supabase/payments";
import { getLeads } from "../lib/supabase/leads";
import { useToast } from "../context/ToastContext";
import { formatVND, formatDate } from "../lib/utils/format";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";
import DataTable from "../components/common/DataTable";
import type { Column } from "../components/common/DataTable";

export const Payments: React.FC = () => {
  const { profile, role } = useAuth();
  const userId = profile?.id || "";

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  // Modal and form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  // Form states
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<"bank_transfer" | "cash" | "cod">(
    "bank_transfer",
  );
  const [status, setStatus] = useState<
    "pending" | "deposit" | "completed" | "failed"
  >("pending");
  const [leadId, setLeadId] = useState("");
  const [notes, setNotes] = useState("");

  // Permissions helpers
  const isAdmin = role === "admin";
  const isAccountantOnly = role === "accountant";
  const canAudit = isAdmin || isAccountantOnly;
  const canCreate = isAdmin || role === "sales" || role === "team_lead";


  // Fetch Payments Query
  const { data, isLoading } = useQuery({
    queryKey: [
      "payments",
      page,
      statusFilter,
      methodFilter,
      userId,
      role,
    ],
    queryFn: () =>
      getPayments({
        page,
        limit: 10,
        status: statusFilter,
        method: methodFilter,
        userId,
        userRole: role || "sales",
      }),
    enabled: !!userId,
  });

  // Fetch Leads List for Form dropdown link
  const { data: leads } = useQuery({
    queryKey: ["allLeadsListForPayments"],
    queryFn: () =>
      getLeads({ page: 1, limit: 100, userId, userRole: role || "sales" }),
    enabled: !!userId,
  });

  // Mutates
  const createMutation = useMutation({
    mutationFn: (newPayment: any) => createPayment(newPayment),
    onSuccess: () => {
      showToast("Ghi nhận giao dịch thanh toán thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Lỗi ghi nhận thanh toán", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updatePayment(id, updates),
    onSuccess: () => {
      showToast("Cập nhật trạng thái giao dịch thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Lỗi cập nhật giao dịch", "error");
    },
  });

  const resetForm = () => {
    setAmount(0);
    setMethod("bank_transfer");
    setStatus("pending");
    setLeadId("");
    setNotes("");
    setEditingPayment(null);
  };

  const handleEditClick = (payment: any) => {
    // Only Accountant or Admin can modify transaction status
    setEditingPayment(payment);
    setAmount(payment.amount);
    setMethod(payment.payment_method);
    setStatus(payment.payment_status);
    setLeadId(payment.lead_id);
    setNotes(payment.notes || "");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!amount || amount <= 0) {
      showToast("Số tiền thanh toán phải lớn hơn 0", "warning");
      return;
    }

    if (!leadId) {
      showToast(
        "Bắt buộc phải liên kết giao dịch với một khách hàng",
        "warning",
      );
      return;
    }

    const payload = {
      lead_id: leadId,
      amount,
      payment_method: method,
      payment_status: status,
      notes: notes || null,
      recorded_by: userId,
    };

    if (editingPayment) {
      let updates;
      if (isAdmin) {
        updates = {
          amount,
          payment_method: method,
          payment_status: status,
          notes: notes || null,
        };
      } else if (isAccountantOnly) {
        updates = { payment_status: status, notes: notes || null };
      } else {
        updates = { amount, payment_method: method, notes: notes || null };
      }

      updateMutation.mutate({ id: editingPayment.id, updates });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "completed":
        return <Badge variant="success">Thành công</Badge>;
      case "deposit":
        return <Badge variant="warning">Đặt cọc</Badge>;
      case "failed":
        return <Badge variant="error">Thất bại</Badge>;
      default:
        return <Badge variant="info">Chờ duyệt</Badge>;
    }
  };

  const getMethodLabel = (m: string) => {
    switch (m) {
      case "bank_transfer":
        return "Chuyển khoản";
      case "cod":
        return "Ship COD";
      default:
        return "Tiền mặt";
    }
  };

  // Columns definition
  const columns: Column<any>[] = [
    {
      header: "Khách hàng",
      accessor: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-gray-800">
            {row.leads?.full_name}
          </div>
          <div className="text-[10px] text-gray-400 font-mono leading-none">
            {row.leads?.phone_primary}
          </div>
        </div>
      ),
    },
    {
      header: "Giá trị giao dịch",
      accessor: (row) => (
        <span className="font-medium text-gray-700">
          {formatVND(row.amount)}
        </span>
      ),
    },
    {
      header: "Phương thức",
      accessor: (row) => <span>{getMethodLabel(row.payment_method)}</span>,
    },
    {
      header: "Ngày ghi nhận",
      accessor: (row) => <span>{formatDate(row.created_at)}</span>,
    },
    {
      header: "Trạng thái",
      accessor: (row) => getStatusBadge(row.payment_status),
    },
    {
      header: "Hành động",
      accessor: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(row);
          }}
          className="text-[#C89A3D] hover:underline text-xs"
        >
          {canAudit ? "Đối soát Duyệt" : "Xem / Sửa"}
        </button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-medium text-gray-800">
            Đối soát Thanh toán
          </h3>
          <p className="text-xs text-gray-400 font-light mt-0.5">
            {canAudit
              ? "Phân quyền Kế toán/Admin: Đối soát khớp tiền ngân hàng và duyệt trạng thái đơn hàng."
              : "Ghi nhận lịch sử giao dịch và đặt cọc yến sào của khách hàng tiềm năng."}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            Ghi nhận Thanh toán
          </Button>
        )}
      </div>

      {/* Filter panel */}
      <GlassCard className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white/50 text-xs font-light focus:border-[#C89A3D] outline-none"
        >
          <option value="">Tất cả Trạng thái giao dịch</option>
          <option value="pending">Chờ duyệt</option>
          <option value="deposit">Đặt cọc</option>
          <option value="completed">Thành công</option>
          <option value="failed">Thất bại</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white/50 text-xs font-light focus:border-[#C89A3D] outline-none"
        >
          <option value="">Tất cả Phương thức</option>
          <option value="bank_transfer">Chuyển khoản ngân hàng</option>
          <option value="cash">Tiền mặt trực tiếp</option>
          <option value="cod">Nhận tiền COD</option>
        </select>

        <div className="text-right text-xs text-gray-400 font-light">
          Tổng số giao dịch: {data?.totalCount || 0}
        </div>
      </GlassCard>

      {/* Payments DataTable */}
      <DataTable
        columns={columns}
        data={data?.payments || []}
        loading={isLoading}
        pagination={
          data
            ? {
                currentPage: page,
                totalPages: data.totalPages,
                onPageChange: (p) => setPage(p),
                totalCount: data.totalCount,
              }
            : undefined
        }
        onRowClick={handleEditClick}
      />

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setModalOpen(false);
              resetForm();
            }}
          />

          <div className="relative glass-panel-accent max-w-md w-full rounded-2xl p-6 shadow-2xl z-10 space-y-5 animate-fade-in">
            <div>
              <h3 className="text-base font-medium text-gray-900">
                {editingPayment
                  ? canAudit
                    ? "Đối soát & Phê duyệt Giao dịch"
                    : "Chi tiết giao dịch Thanh toán"
                  : "Ghi nhận giao dịch mới"}
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                {canAudit
                  ? "Đối soát sao kê ngân hàng và cập nhật chính xác trạng thái giao dịch."
                  : "Sales nhập đúng số tiền thực thu hoặc tiền cọc từ khách hàng."}
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="w-full flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng thanh toán
                </label>
                <select
                  disabled={editingPayment !== null}
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none disabled:opacity-50"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {leads?.leads?.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.full_name} ({lead.phone_primary})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Số tiền giao dịch (VND) *"
                  type="number"
                  disabled={editingPayment && isAccountantOnly}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="5000000"
                />

                <div className="w-full flex flex-col space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phương thức
                  </label>
                  <select
                    disabled={editingPayment && isAccountantOnly}
                    value={method}
                    onChange={(e: any) => setMethod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none disabled:opacity-50"
                  >
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="cod">Ship COD</option>
                  </select>
                </div>
              </div>

              {/* Accountant/Admin specific confirmation field */}
              {canAudit && (
                <div className="w-full flex flex-col space-y-1.5 p-3 bg-[#F9F5EE] border border-[#EFEAE0] rounded-xl">
                  <label className="text-xs font-medium text-amber-800 uppercase tracking-wider">
                    KẾ TOÁN: TRẠNG THÁI DUYỆT
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#C89A3D] outline-none"
                  >
                    <option value="pending">Chờ duyệt (Pending)</option>
                    <option value="deposit">Đã cọc (Deposit)</option>
                    <option value="completed">Thành công (Completed)</option>
                    <option value="failed">Thất bại (Failed)</option>
                  </select>
                </div>
              )}

              <div className="w-full flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú giao dịch
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nội dung chuyển khoản: CK cọc 50% mua yến sào thô thượng hạng..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                Quay lại
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingPayment
                  ? isAccountant
                    ? "Duyệt giao dịch"
                    : "Lưu thay đổi"
                  : "Ghi nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Payments;
