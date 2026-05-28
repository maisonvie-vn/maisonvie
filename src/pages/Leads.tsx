import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  checkDuplicateLead,
} from "../lib/supabase/leads";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../lib/utils/format";
import { normalizePhone, validatePhoneVN } from "../lib/utils/phone";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";
import DataTable from "../components/common/DataTable";
import type { Column } from "../components/common/DataTable";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Papa from "papaparse";

export const Leads: React.FC = () => {
  const { profile, role } = useAuth();
  const userId = profile?.id || "";

  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for query bounds
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");

  // States for Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState<"vip" | "retail" | "agent">("retail");
  const [status, setStatus] = useState("new");
  const [productInterest, setProductInterest] = useState<
    "raw_nest" | "stewed_nest" | "refined_nest" | ""
  >("");
  const [notes, setNotes] = useState("");

  // Debounced duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Debounce search input at 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Debounce duplicate phone/email checking at 500ms
  useEffect(() => {
    if (!phone || editingLead) {
      setDuplicateWarning(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const normalized = normalizePhone(phone);
        const { duplicate, lead } = await checkDuplicateLead(normalized, email);
        if (duplicate && lead) {
          setDuplicateWarning(
            `Cảnh báo: Số điện thoại/Email này đã tồn tại dưới tên "${lead.full_name}"!`,
          );
        } else {
          setDuplicateWarning(null);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trùng lặp:", err);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [phone, email, editingLead]);

  // React Query Fetch Leads
  const { data, isLoading } = useQuery({
    queryKey: [
      "leads",
      page,
      debouncedSearch,
      statusFilter,
      segmentFilter,
      userId,
      role,
    ],
    queryFn: () =>
      getLeads({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter,
        segment: segmentFilter,
        userId,
        userRole: role || "sales",
      }),
    enabled: !!userId,
  });

  // Mutates
  const createMutation = useMutation({
    mutationFn: (newLead: any) => createLead(newLead),
    onSuccess: () => {
      showToast("Tạo hồ sơ khách hàng thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Lỗi tạo khách hàng", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateLead(id, updates),
    onSuccess: () => {
      showToast("Cập nhật hồ sơ khách hàng thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Lỗi cập nhật khách hàng", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      showToast("Đã xóa mềm hồ sơ khách hàng thành công.", "success");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    },
    onError: (err: any) => {
      showToast(err.message || "Không thể xóa khách hàng", "error");
    },
  });

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setSegment("retail");
    setStatus("new");
    setProductInterest("");
    setNotes("");
    setEditingLead(null);
    setDuplicateWarning(null);
  };

  const handleEditClick = (lead: any) => {
    setEditingLead(lead);
    setFullName(lead.full_name);
    setPhone(lead.phone_primary);
    setEmail(lead.email || "");
    setSegment(lead.segment);
    setStatus(lead.status);
    setProductInterest(lead.product_interests?.[0] || "");
    setNotes(lead.notes || "");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!fullName || !phone) {
      showToast(
        "Họ tên và số điện thoại chính là thông tin bắt buộc",
        "warning",
      );
      return;
    }

    if (!validatePhoneVN(phone)) {
      showToast(
        "Số điện thoại di động Việt Nam không đúng định dạng",
        "warning",
      );
      return;
    }

    const payload = {
      full_name: fullName,
      phone_primary: normalizePhone(phone),
      email: email || null,
      segment,
      product_interests: productInterest ? [productInterest] : [],
      notes: notes || null,
      assigned_to: userId,
    };

    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  // PapaParse CSV Export
  const handleExportCSV = () => {
    if (!data?.leads || data.leads.length === 0) {
      showToast("Không có dữ liệu khách hàng để xuất file", "warning");
      return;
    }

    const exportData = data.leads.map((l) => ({
      "Họ và tên": l.full_name,
      "Số điện thoại": l.phone_primary,
      Email: l.email || "-",
      "Phân khúc":
        l.segment === "vip"
          ? "VIP"
          : l.segment === "agent"
            ? "Đại lý"
            : "Khách lẻ",
      "Trạng thái":
        l.status === "new"
          ? "Mới"
          : l.status === "contacted"
            ? "Đã liên hệ"
            : "Đơn hàng thành công",
      "Sản phẩm quan tâm":
        l.product_interests?.includes("raw_nest")
          ? "Yến thô"
          : l.product_interests?.includes("stewed_nest")
            ? "Yến chưng sẵn"
            : l.product_interests?.includes("refined_nest")
              ? "Yến tinh chế"
              : "Không có",
      "Ghi chú": l.notes || "",
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
      type: "text/csv;charset=utf-8;",
    }); // Add BOM for excel support
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `danh_sach_khach_hang_${new Date().toLocaleDateString("vi-VN")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PapaParse CSV Import
  const handleImportCSVClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedLeads = results.data;
        let successCount = 0;

        try {
          for (const row of parsedLeads as any[]) {
            const rawPhone = row["Số điện thoại"] || row["phone_primary"];
            const rawName = row["Họ và tên"] || row["full_name"];
            if (!rawName || !rawPhone) continue;

            await createLead({
              full_name: rawName,
              phone_primary: normalizePhone(rawPhone),
              email: row["Email"] || row["email"] || null,
              segment:
                row["Phân khúc"] === "VIP"
                  ? "vip"
                  : row["Phân khúc"] === "Đại lý"
                    ? "agent"
                    : "retail",
              notes: row["Ghi chú"] || row["notes"] || null,
              assigned_to: userId,
            });
            successCount++;
          }

          showToast(
            `Nhập dữ liệu thành công ${successCount} khách hàng tiềm năng!`,
            "success",
          );
          queryClient.invalidateQueries({ queryKey: ["leads"] });
        } catch (err: any) {
          showToast(`Nhập dữ liệu gặp lỗi giữa chừng: ${err.message}`, "error");
        }
      },
    });

    // Reset input file value to allow importing the same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  // DataTable column definitions
  const columns: Column<any>[] = [
    {
      header: "Họ và tên",
      accessor: (row) => (
        <div className="font-medium text-gray-800">{row.full_name}</div>
      ),
      sortable: true,
      sortKey: "full_name",
    },
    {
      header: "Số điện thoại",
      accessor: (row) => (
        <span className="font-mono text-gray-600">{row.phone_primary}</span>
      ),
    },
    {
      header: "Phân khúc",
      accessor: (row) => {
        if (row.segment === "vip") return <Badge variant="vip">VIP</Badge>;
        if (row.segment === "agent")
          return <Badge variant="agent">Đại lý</Badge>;
        return <Badge variant="retail">Khách lẻ</Badge>;
      },
    },
    {
      header: "Ngày gia nhập",
      accessor: (row) => <span>{formatDate(row.created_at)}</span>,
      sortable: true,
      sortKey: "created_at",
    },
    {
      header: "Trạng thái",
      accessor: (row) => {
        return row.is_active ? (
          <span className="text-green-600 font-light">Hoạt động</span>
        ) : (
          <span className="text-gray-400 font-light">Ngừng hoạt động</span>
        );
      },
    },
    {
      header: "Hành động",
      accessor: (row) => (
        <div className="flex items-center space-x-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            Sửa
          </button>
          <button
            onClick={(e) => handleDeleteClick(row.id, e)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            Xóa
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-medium text-gray-800">
            Danh sách Khách hàng
          </h3>
          <p className="text-xs text-gray-400 font-light">
            Quản lý hồ sơ khách hàng tiềm năng yến sào Vĩnh Hưng.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <Button variant="ghost" onClick={handleImportCSVClick}>
            Nhập CSV
          </Button>
          <Button variant="secondary" onClick={handleExportCSV}>
            Xuất Excel CSV
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Thêm Khách hàng
          </Button>
        </div>
      </div>

      {/* Filter and search bar */}
      <GlassCard className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, SĐT, email..."
            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white/50 text-xs font-light focus:border-[#C89A3D] outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white/50 text-xs font-light focus:border-[#C89A3D] outline-none"
        >
          <option value="">Hoạt động (Mặc định)</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>

        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white/50 text-xs font-light focus:border-[#C89A3D] outline-none"
        >
          <option value="">Tất cả Phân khúc</option>
          <option value="vip">Phân khúc VIP</option>
          <option value="retail">Phân khúc Khách lẻ</option>
          <option value="agent">Phân khúc Đại lý</option>
        </select>

        <div className="text-right text-xs text-gray-400 font-light">
          Tổng số: {data?.totalCount || 0} khách hàng
        </div>
      </GlassCard>

      {/* Leads Table */}
      <DataTable
        columns={columns}
        data={data?.leads || []}
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

      {/* Add/Edit Modal */}
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
                {editingLead
                  ? "Sửa thông tin Khách hàng"
                  : "Thêm hồ sơ Khách hàng mới"}
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Nhập chính xác họ tên và số điện thoại di động Việt Nam.
              </p>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Họ và tên khách hàng *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Thị B"
              />

              <Input
                label="Số điện thoại di động *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XXXXXXXX"
              />

              {duplicateWarning && (
                <p className="text-[11px] text-amber-500 font-light bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 leading-normal animate-pulse">
                  {duplicateWarning}
                </p>
              )}

              <Input
                label="Địa chỉ Email (nếu có)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="w-full flex flex-col space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phân khúc
                  </label>
                  <select
                    value={segment}
                    onChange={(e: any) => setSegment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none"
                  >
                    <option value="retail">Khách lẻ</option>
                    <option value="vip">VIP</option>
                    <option value="agent">Đại lý</option>
                  </select>
                </div>

                <div className="w-full flex flex-col space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mức độ quan tâm
                  </label>
                  <select
                    value={productInterest}
                    onChange={(e: any) => setProductInterest(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none"
                  >
                    <option value="">Không có</option>
                    <option value="raw_nest">Yến sào thô</option>
                    <option value="stewed_nest">Yến chưng sẵn</option>
                    <option value="refined_nest">Yến tinh chế</option>
                  </select>
                </div>
              </div>

              <div className="w-full flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú đặc trưng
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Yêu cầu giao chiều tối, thích mẫu hộp quà vàng kim..."
                  rows={3}
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
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingLead ? "Lưu cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xóa hồ sơ khách hàng tiềm năng"
        message="Hành động này sẽ xóa mềm hồ sơ của khách hàng khỏi hệ thống vận hành hiển thị. Bạn có chắc chắn muốn thực hiện?"
        confirmText="Đúng, Xóa ngay"
        cancelText="Không xóa"
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
};
export default Leads;
