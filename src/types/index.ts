import { Database } from "./supabase";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type UserRole = "admin" | "team_lead" | "sales" | "accountant";
export type SegmentType = "vip" | "retail" | "agent";
export type ProductInterestType = "raw_nest" | "stewed_nest" | "refined_nest";
export type TaskPriorityType = "low" | "medium" | "high";
export type TaskStatusType = "todo" | "in_progress" | "completed" | "overdue";
export type PaymentMethodType = "bank_transfer" | "cash" | "cod";
export type PaymentStatusType = "pending" | "deposit" | "completed" | "failed";

export type Organization = Tables<"organizations">;
export type Profile = Tables<"profiles">;
export type Team = Tables<"teams">;
export type TeamMember = Tables<"team_members">;
export type PipelineStage = Tables<"pipeline_stages">;
export type Lead = Tables<"leads">;
export type LeadTag = Tables<"lead_tags">;
export type LeadTagAssignment = Tables<"lead_tag_assignments">;
export type Opportunity = Tables<"opportunities">;
export type Task = Tables<"tasks">;
export type Payment = Tables<"subscriptions">; // The subscription table stores payment info in this schema
export type ActivityLog = Tables<"activity_logs">;

export interface AppToast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}
