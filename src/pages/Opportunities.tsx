import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  getPipelineStages,
  getOpportunities,
  updateOpportunityStage,
  createOpportunity,
  deleteOpportunity,
} from "../lib/supabase/opportunities";
import { getLeads } from "../lib/supabase/leads";
import { supabase } from "../lib/supabase/client";
import { useToast } from "../context/ToastContext";
import { formatVND } from "../lib/utils/format";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import GlassCard from "../components/common/GlassCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Skeleton from "../components/common/Skeleton";
import Badge from "../components/common/Badge";

// 1. Draggable Card Component
interface OpportunityCardProps {
  opportunity: any;
  activeLockUser?: string;
  onEdit: (opp: any) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  activeLockUser,
  onEdit,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: opportunity.id.toString(),
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 100 : "auto",
      }
    : undefined;

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case "vip":
        return <Badge variant="vip">VIP</Badge>;
      case "agent":
        return <Badge variant="agent">Đại lý</Badge>;
      default:
        return <Badge variant="retail">Lẻ</Badge>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-white/60 hover:bg-white border border-white/80 rounded-xl shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md space-y-3 relative group"
    >
      {/* Drag handle area */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-x-0 top-0 h-4 cursor-grab"
      />

      {/* Lock indicator */}
      {activeLockUser && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-[10px] text-amber-600 border border-amber-200">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
          <span>{activeLockUser} đang sửa</span>
        </div>
      )}

      <div className="space-y-1.5 pt-2">
        <h5 className="text-xs font-medium text-gray-800 line-clamp-1">
          {opportunity.title}
        </h5>
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-light">
          <span>{opportunity.leads?.full_name}</span>
          {getSegmentBadge(opportunity.leads?.segment)}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
        <span className="text-xs font-medium text-[#C89A3D]">
          {formatVND(opportunity.value)}
        </span>

        {/* Action Button */}
        <button
          onClick={() => onEdit(opportunity)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-opacity"
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
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 2. Droppable Column Component
interface KanbanColumnProps {
  stage: any;
  opportunities: any[];
  locks: Record<string, string>;
  onEditCard: (opp: any) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  opportunities,
  locks,
  onEditCard,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const columnValueSum = opportunities.reduce(
    (sum, opp) => sum + (opp.value || 0),
    0,
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col space-y-4 w-[280px] p-4 rounded-2xl transition-colors duration-200 flex-shrink-0 ${
        isOver
          ? "bg-amber-50/30 border border-dashed border-[#C89A3D]/20"
          : "bg-[#F9F5EE]/40 border border-transparent"
      }`}
    >
      {/* Column Header */}
      <div className="flex justify-between items-center px-1">
        <div className="space-y-0.5">
          <h4 className="text-xs font-medium text-gray-800 leading-none">
            {stage.name}
          </h4>
          <span className="text-[10px] text-gray-400 font-light">
            {opportunities.length} cơ hội
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {formatVND(columnValueSum)}
        </span>
      </div>

      {/* Cards Scrollable Area */}
      <div className="flex-1 flex flex-col space-y-3 min-h-[500px]">
        {opportunities.map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            activeLockUser={locks[opp.id]}
            onEdit={onEditCard}
          />
        ))}
      </div>
    </div>
  );
};

// 3. Main Page Component
export const Opportunities: React.FC = () => {
  const { profile, role } = useAuth();
  const userId = profile?.id || "";
  const fullName = profile?.full_name || "";

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeLocks, setActiveLocks] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [value, setValue] = useState(0);
  const [leadId, setLeadId] = useState("");
  const [stageId, setStageId] = useState("");

  // Sensors for DnD pointers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Queries
  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ["pipelineStages"],
    queryFn: () => getPipelineStages(),
    enabled: !!userId,
  });

  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ["opportunities", userId, role],
    queryFn: () =>
      getOpportunities({ userId, userRole: role || "sales" }),
    enabled: !!userId,
  });

  const { data: leads } = useQuery({
    queryKey: ["allLeadsList"],
    queryFn: () =>
      getLeads({ page: 1, limit: 100, userId, userRole: role || "sales" }),
    enabled: !!userId,
  });

  // Mutate Stage drag drop
  const updateStageMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      updateOpportunityStage(id, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Lỗi cập nhật giai đoạn cơ hội", "error");
    },
  });

  // Mutate create
  const createMutation = useMutation({
    mutationFn: (newOpp: any) => createOpportunity(newOpp),
    onSuccess: () => {
      showToast("Tạo cơ hội mới thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      showToast(err.message || "Không thể tạo cơ hội", "error");
    },
  });

  // Realtime pessimistic locks setup
  useEffect(() => {
    if (!userId) return;

    // Create a broadcast channel for kanban locks
    const channel = supabase.channel(`kanban_locks`);

    channel
      .on("broadcast", { event: "lock" }, (payload: any) => {
        const { cardId, user } = payload.payload;
        setActiveLocks((prev) => ({ ...prev, [cardId]: user }));
      })
      .on("broadcast", { event: "unlock" }, (payload: any) => {
        const { cardId } = payload.payload;
        setActiveLocks((prev) => {
          const next = { ...prev };
          delete next[cardId];
          return next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const sendLockBroadcast = (cardId: string) => {
    const channel = supabase.channel(`kanban_locks`);
    channel.send({
      type: "broadcast",
      event: "lock",
      payload: { cardId, user: fullName },
    });
    // Record locally
    setActiveLocks((prev) => ({ ...prev, [cardId]: fullName }));
  };

  const sendUnlockBroadcast = (cardId: string) => {
    const channel = supabase.channel(`kanban_locks`);
    channel.send({
      type: "broadcast",
      event: "unlock",
      payload: { cardId },
    });
    // Remove locally
    setActiveLocks((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const resetForm = () => {
    setTitle("");
    setValue(0);
    setLeadId("");
    setStageId("");
    setEditingOpp(null);
  };

  const handleEditClick = (opp: any) => {
    setEditingOpp(opp);
    setTitle(opp.title);
    setValue(opp.value);
    setLeadId(opp.lead_id);
    setStageId(opp.stage_id);
    setModalOpen(true);

    // Send lock notification
    sendLockBroadcast(opp.id);
  };

  const handleModalClose = () => {
    if (editingOpp) {
      sendUnlockBroadcast(editingOpp.id);
    }
    setModalOpen(false);
    resetForm();
  };

  const handleSave = () => {
    if (!title || !leadId || !stageId) {
      showToast("Vui lòng điền đầy đủ các thông tin bắt buộc", "warning");
      return;
    }

    const payload = {
      lead_id: leadId,
      stage_id: stageId,
      title,
      value,
      assigned_to: userId,
    };

    if (editingOpp) {
      // Logic update can be mapped here
      sendUnlockBroadcast(editingOpp.id);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const nextStageId = over.id as string;

    const currentOpp = opportunities?.find((o) => o.id.toString() === cardId);
    if (currentOpp && currentOpp.stage_id !== nextStageId) {
      // Optimistic lock alert if someone else is editing
      if (activeLocks[cardId] && activeLocks[cardId] !== fullName) {
        showToast(
          `Không thể di chuyển: ${activeLocks[cardId]} đang chỉnh sửa cơ hội này!`,
          "warning",
        );
        return;
      }

      updateStageMutation.mutate({ id: cardId, stageId: nextStageId });
    }
  };

  if (stagesLoading || oppsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-8 w-1/4" />
          <Skeleton variant="rect" className="h-10 w-32" />
        </div>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard
              key={i}
              className="w-[280px] p-4 flex-shrink-0 space-y-4"
            >
              <Skeleton variant="text" className="h-4 w-1/2" />
              <Skeleton variant="rect" className="h-[200px] w-full" />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-medium text-gray-800">
            Đường ống Cơ hội
          </h3>
          <p className="text-xs text-gray-400 font-light">
            Kéo thả cơ hội để cập nhật phễu bán hàng. Hệ thống đồng bộ real-time
            khóa card khi sửa đổi.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Thêm cơ hội mới</Button>
      </div>

      {/* Kanban Board area */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar">
          {stages?.map((stage) => {
            const oppsInStage =
              opportunities?.filter((opp) => opp.stage_id === stage.id) || [];
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                opportunities={oppsInStage}
                locks={activeLocks}
                onEditCard={handleEditClick}
              />
            );
          })}
        </div>
      </DndContext>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleModalClose}
          />

          <div className="relative glass-panel-accent max-w-md w-full rounded-2xl p-6 shadow-2xl z-10 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-medium text-gray-900">
                {editingOpp
                  ? "Thông tin chi tiết Cơ hội"
                  : "Thêm Cơ hội bán hàng mới"}
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Thiết lập giá trị tạm tính và liên kết hồ sơ khách hàng
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Tiêu đề Cơ hội"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mua Yến thô làm quà tặng đối tác"
              />

              <div className="w-full flex flex-col space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng liên kết
                </label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none"
                >
                  <option value="">-- Chọn khách hàng tiềm năng --</option>
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
                    Giai đoạn
                  </label>
                  <select
                    value={stageId}
                    onChange={(e) => setStageId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 text-sm font-light focus:border-[#C89A3D] outline-none"
                  >
                    <option value="">-- Giai đoạn --</option>
                    {stages?.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Giá trị tạm tính (VND)"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder="5000000"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="ghost" onClick={handleModalClose}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingOpp ? "Đóng và Lưu" : "Tạo mới"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Opportunities;
