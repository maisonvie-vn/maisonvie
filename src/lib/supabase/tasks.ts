import { supabase } from "./client";
import type { Task, InsertTables, UpdateTables } from "../../types";

export const getTasks = async ({
  userId = "",
  userRole = "sales",
  status = "",
  priority = "",
}: {
  userId?: string;
  userRole?: string;
  status?: string;
  priority?: string;
}) => {
  let query = supabase
    .from("tasks")
    .select("*, leads(full_name)");

  // Apply filters
  if (status) {
    const dbStatus = status === "completed" ? "done" : status;
    query = query.eq("status", dbStatus);
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
  return (data as any[]).map(t => ({
    ...t,
    status: t.status === "done" ? "completed" : t.status
  })) as (Task & { leads: { full_name: string } | null })[];
};

export const createTask = async (task: any) => {
  const dbPayload = {
    ...task,
    status: task.status === "completed" ? "done" : task.status
  };
  const { data, error } = await supabase
    .from("tasks")
    .insert(dbPayload)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    status: data.status === "done" ? "completed" : data.status
  } as Task;
};

export const updateTask = async (id: string, task: any) => {
  const dbPayload = {
    ...task,
    status: task.status === "completed" ? "done" : task.status,
    updated_at: new Date().toISOString()
  };
  if (task.status === "completed") {
    dbPayload.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    status: data.status === "done" ? "completed" : data.status
  } as Task;
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
  return true;
};
