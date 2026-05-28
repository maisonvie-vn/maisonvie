import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../lib/supabase/tasks";
import { getLeads } from "../lib/supabase/leads";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../lib/utils/format";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Skeleton from "../components/common/Skeleton";

export const Tasks: React.FC = () => {
  const { profile, role } = useAuth();
  const userId = profile?.id || "";

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Modal and Delete states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [leadId, setLeadId] = useState("");

  // Fetch Tasks Query
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", userId, role, statusFilter, priorityFilter],
    queryFn: () =>
      getTasks({
        userId,
        userRole: role || "sales",
        status: statusFilter,
        priority: priorityFilter,
      }),
    enabled: !!userId,
  });

  // Fetch Leads List for form link dropdown
  const { data: leads } = useQuery({
    queryKey: ["allLeadsListForTasks"],
    queryFn: () =>
      getLeads({ page: 1, limit: 100, userId, userRole: role || "sales" }),
    enabled: !!userId,
  });

  // Mutates
  const createMutation = useMutation({
    mutationFn: (newTask: any) => createTask(newTask),
    onSuccess: () => {
      showToast("Thêm mới công việc thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Lỗi thêm công việc", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateTask(id, updates),
    onSuccess: () => {
      showToast("Cập nhật trạng thái công việc thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Lỗi cập nhật công việc", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      showToast("Đã xóa công việc thành công.", "success");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    },
    onError: (err: any) => {
      showToast(err.message || "Không thể xóa công việc", "error");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setLeadId("");
    setEditingTask(null);
  };

  const handleEditClick = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.due_date ? task.due_date.substring(0, 10) : "");
    setLeadId(task.lead_id || "");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!title) {
      showToast("Tiêu đề công việc là bắt buộc", "warning");
      return;
    }

    const payload = {
      title,
      description: description || null,
      priority,
      status: editingTask ? editingTask.status : "todo",
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      lead_id: leadId || null,
      assigned_to: userId,
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleComplete = (
    task: any,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();
    const nextStatus = e.target.checked ? "completed" : "todo";
    updateMutation.mutate({
      id: task.id,
      updates: { status: nextStatus },
    });
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const due = new Date(dateString);
    const now = new Date();
    return due < now;
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "high":
        return <Badge variant="high">Cao</Badge>;
      case "medium":
        return <Badge variant="medium">Trung bình</Badge>;
      default:
        return <Badge variant="low">Thấp</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-medium text-gray-800">
            Nhiệm vụ & Công việc
          </h3>
          <p className="text-xs text-gray-400 font-light">
            Theo dõi danh sách các đầu việc cần giải quyết gắn liền với hồ sơ
            khách hàng.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Thêm công việc mới</Button>
      </div>

      {/* Filter and stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <GlassCard className="p-4 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-light">Chưa làm</span>
          <span className="text-base font-medium text-gray-800">
            {(tasks || []).filter((t) => t.status === "todo").length}
          </span>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-light">
            Đang tiến hành
          </span>
          <span className="text-base font-medium text-[#C89A3D]">
            {(tasks || []).filter((t) => t.status === "in_progress").length}
          </span>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-light">
            Đã hoàn thành
          </span>
          <span className="text-base font-medium text-emerald-600">
            {(tasks || []).filter((t) => t.status === "completed").length}
          </span>
        </GlassCard>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/50 text-xs font-light focus:border-[#C89A3D] outline-none"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="todo">Chưa thực hiện</option>
            <option value="in_progress">Đang tiến hành</option>
            <option value="completed">Đã xong</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/50 text-xs font-light focus:border-[#C89A3D] outline-none"
          >
            <option value="">Tất cả Độ ưu tiên</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </div>

      {/* Task Rows List */}
      <div className="space-y-3.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <GlassCard
              key={i}
              className="p-4 flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-3 w-1/3">
                <Skeleton variant="circle" className="w-5 h-5" />
                <Skeleton variant="text" className="h-4 w-full" />
              </div>
              <Skeleton variant="text" className="h-4 w-1/4" />
            </GlassCard>
          ))
        ) : tasks?.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl text-gray-400 font-light text-sm">
            Không tìm thấy công việc tương ứng nào.
          </div>
        ) : (
          tasks?.map((task) => {
            const taskOverdue =
              task.status !== "completed" && isOverdue(task.due_date);
            return (
              <GlassCard
                key={task.id}
                onClick={() => handleEditClick(task)}
                className={`p-4 flex items-center justify-between space-x-6 cursor-pointer hover:shadow-md transition-shadow ${
                  taskOverdue ? "border-l-4 border-l-red-500" : ""
                }`}
              >
                {/* Left check and Title */}
                <div className="flex items-center space-x-4 overflow-hidden flex-1">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={(e) => handleToggleComplete(task, e)}
                    onClick={(e) => e.stopPropagation()} // Stop clicking card modal triggering
                    className="w-4 h-4 rounded text-[#C89A3D] focus:ring-[#C89A3D] border-gray-300"
                  />
                  <div className="overflow-hidden space-y-0.5">
                    <h5
                      className={`text-sm font-medium text-gray-800 truncate ${
                        task.status === "completed"
                          ? "line-through text-gray-400 font-light"
                          : ""
                      }`}
                    >
                      {task.title}
                    </h5>
                    <p className="text-xs text-gray-400 font-light truncate">
                      {task.description || "Không có mô tả chi tiết"}
                    </p>
                  </div>
                </div>

                {/* Details Right */}
                <div className="flex items-center space-x-6 flex-shrink-0">
                  {task.leads && (
                    <div className="text-xs text-gray-500 font-light bg-white/50 px-2.5 py-1 rounded-full border border-gray-100">
                      KH: {task.leads.full_name}
                    </div>
                  )}

                  {getPriorityBadge(task.priority)}

                  <div className="text-right space-y-0.5 min-w-[80px]">
                    <p
                      className={`text-xs font-mono font-light ${taskOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}
                    >
                      {task.due_date ? formatDate(task.due_date) : "Không có"}
                    </p>
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest leading-none">
                      Hạn chót
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteClick(task.id, e)}
                    className="text-red-400 hover:text-red-600 transition-colors"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

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
                {editingTask
                  ? "Sửa thông tin công việc"
                  : "Thêm công việc cần xử lý mới"}
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Gắn công việc với một khách hàng tiềm năng cụ thể để dễ đối
                chiếu.
              </p>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Tiêu đề công việc *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Gọi điện tư vấn yến thô loại A"
              />

              <div className="w-full flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả công việc
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Khách muốn mua làm quà biếu sếp, cần tư vấn thêm hộp gỗ lụa sang trọng..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none resize-none"
                />
              </div>

              <div className="w-full flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng liên quan
                </label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none"
                >
                  <option value="">-- Không có (Khách vãng lai) --</option>
                  {leads?.leads?.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.full_name} ({lead.phone_primary})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="w-full flex flex-col space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>

                <Input
                  label="Hạn chót hoàn thành"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                {editingTask ? "Lưu cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xóa bỏ đầu việc"
        message="Hành động này sẽ xóa hoàn toàn đầu việc khỏi hệ thống quản lý. Bạn có chắc chắn muốn xóa?"
        confirmText="Đúng, Xóa ngay"
        cancelText="Giữ lại"
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
};
export default Tasks;
