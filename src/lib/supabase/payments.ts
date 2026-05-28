import { supabase } from "./client";
import type { Payment, InsertTables, UpdateTables } from "../../types";

export const getPayments = async ({
  page = 1,
  limit = 10,
  status = "",
  method = "",
  userId = "",
  userRole = "sales",
}: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  userId?: string;
  userRole?: string;
}) => {
  const offset = (page - 1) * limit;

  // Query includes details about the lead
  let query = supabase
    .from("subscriptions")
    .select("*, leads(full_name, phone_primary)", { count: "exact" });

  // Filters
  if (status) {
    query = query.eq("payment_status", status);
  }
  if (method) {
    query = query.eq("payment_method", method);
  }

  // Accountant sees everything, Sales only see payments for leads they own
  if (userRole === "sales" && userId) {
    query = query.eq("recorded_by", userId);
  }

  query = query.order("created_at", { ascending: false });
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    payments:
      (data as (Payment & {
        leads: { full_name: string; phone_primary: string };
      })[]) || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const createPayment = async (payment: InsertTables<"subscriptions">) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
};

export const updatePayment = async (
  id: string,
  payment: UpdateTables<"subscriptions">,
) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ ...payment, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
};
