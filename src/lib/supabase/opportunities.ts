import { supabase } from "./client";
import type {
  Opportunity,
  PipelineStage,
  InsertTables,
  UpdateTables,
} from "../../types";

export const getPipelineStages = async () => {
  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("*")
    .order("order_num", { ascending: true });

  if (error) throw error;
  return data as PipelineStage[];
};

export const getOpportunities = async ({
  userId = "",
  userRole = "sales",
}: {
  userId?: string;
  userRole?: string;
}) => {
  let query = supabase
    .from("opportunities")
    .select("*, leads(full_name, phone_primary, segment)")
    .is("deleted_at", null);

  // Apply role filtering to be extremely safe
  if (userRole === "sales" && userId) {
    query = query.eq("assigned_to", userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as (Opportunity & {
    leads: { full_name: string; phone_primary: string; segment: string };
  })[];
};

export const createOpportunity = async (opp: InsertTables<"opportunities">) => {
  const { data, error } = await supabase
    .from("opportunities")
    .insert(opp)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
};

export const updateOpportunity = async (
  id: string,
  opp: UpdateTables<"opportunities">,
) => {
  const { data, error } = await supabase
    .from("opportunities")
    .update({ ...opp, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
};

export const updateOpportunityStage = async (id: string, stageId: string) => {
  const { data, error } = await supabase
    .from("opportunities")
    .update({
      stage_id: stageId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
};

export const deleteOpportunity = async (id: string) => {
  const { data, error } = await supabase
    .from("opportunities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
};
