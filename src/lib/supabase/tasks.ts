import { supabase } from "./client";
import type { Task, InsertTables, UpdateTables } from "../../types";

export const getTasks = async ({
  orgId,
  userId = "",
  userRole = "sales",
  status = "",
  priority = "",
}: {
  orgId: string;
  userId?: string;
  userRole?: string;
  status?: string;
  priority?: string;
}) => {
  let query = supabase
    .from("tasks")
    .select("*, leads(full_name)")
    .eq("organization_id", orgId);

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }
  if (priority) {
    query = query.eq("priority", priority);
  }

  // Apply role filtering to be extremely safe
  if (userRole === "sales" && userId) {
    query = query.eq("assigned_to", userId);
  }

  // Sort by deadline first, then priority, then creation date
  query = query.order("due_date", { ascending: true, nullsFirst: false });

  const { data, error } = await query;

  if (error) throw error;
  return data as (Task & { leads: { full_name: string } | null })[];
};

export const createTask = async (task: InsertTables<"tasks">) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
};

export const updateTask = async (id: string, task: UpdateTables<"tasks">) => {
  // If task status is set to completed, also record completed_at
  const updates = { ...task, updated_at: new Date().toISOString() };
  if (task.status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
  return true;
};
