import { supabase } from "./client";
import type { Lead, InsertTables, UpdateTables } from "../../types";

export const getLeads = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  segment = "",
  userId = "",
  userRole = "sales",
}) => {
  const offset = (page - 1) * limit;

  // Build base query
  let query = supabase
    .from("leads")
    .select("*", { count: "exact" });

  if (status === "inactive") {
    query = query.eq("is_active", false);
  } else {
    query = query.eq("is_active", true);
  }

  // Apply search filter (phone or name or email)
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone_primary.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }

  // Apply segment filter
  if (segment) {
    query = query.eq("segment", segment);
  }

  // Role-based filtering if RLS isn't already handling it to be extremely safe
  if (userRole === "sales" && userId) {
    query = query.eq("assigned_to", userId);
  }

  // Sorting
  query = query.order("created_at", { ascending: false });

  // Pagination bounds
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    leads: (data as Lead[]) || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const createLead = async (lead: InsertTables<"leads">) => {
  const { data, error } = await supabase
    .from("leads")
    .insert(lead)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
};

export const updateLead = async (id: string, lead: UpdateTables<"leads">) => {
  const { data, error } = await supabase
    .from("leads")
    .update({ ...lead, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
};

export const deleteLead = async (id: string) => {
  // Soft delete as defined by schema
  const { data, error } = await supabase
    .from("leads")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
};

/**
 * Kiểm tra trùng lặp số điện thoại hoặc email trong CSDL
 */
export const checkDuplicateLead = async (
  phone: string,
  email?: string | null,
) => {
  if (!phone && !email) return { duplicate: false, type: null };

  let query = supabase
    .from("leads")
    .select("id, full_name")
    .eq("is_active", true);

  if (phone && email) {
    query = query.or(`phone_primary.eq.${phone},email.eq.${email}`);
  } else if (phone) {
    query = query.eq("phone_primary", phone);
  } else if (email) {
    query = query.eq("email", email);
  }

  const { data, error } = await query;

  if (error) throw error;

  if (data && data.length > 0) {
    return {
      duplicate: true,
      lead: data[0],
    };
  }

  return { duplicate: false };
};
