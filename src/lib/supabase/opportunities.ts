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
    .order("sort_order", { ascending: true });

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
    .eq("is_active", true);

  // Apply role filtering to be extremely safe
  if (userRole === "sales" && userId) {
    query = query.eq("assigned_to", userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as any[]).map(opp => ({
    ...opp,
    value: Number(opp.expected_value || 0)
  })) as (Opportunity & {
    leads: { full_name: string; phone_primary: string; segment: string };
  })[];
};

export const createOpportunity = async (opp: any) => {
  const dbPayload = {
    lead_id: opp.lead_id,
    stage_id: opp.stage_id,
    title: opp.title,
    expected_value: opp.value || 0,
    assigned_to: opp.assigned_to,
  };
  const { data, error } = await supabase
    .from("opportunities")
    .insert(dbPayload)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    value: Number(data.expected_value || 0)
  } as Opportunity;
};

export const updateOpportunity = async (
  id: string,
  opp: any,
) => {
  const dbPayload: any = {};
  if (opp.lead_id !== undefined) dbPayload.lead_id = opp.lead_id;
  if (opp.stage_id !== undefined) dbPayload.stage_id = opp.stage_id;
  if (opp.title !== undefined) dbPayload.title = opp.title;
  if (opp.value !== undefined) dbPayload.expected_value = opp.value;
  if (opp.assigned_to !== undefined) dbPayload.assigned_to = opp.assigned_to;

  const { data, error } = await supabase
    .from("opportunities")
    .update({ ...dbPayload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    value: Number(data.expected_value || 0)
  } as Opportunity;
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
  return {
    ...data,
    value: Number(data.expected_value || 0)
  } as Opportunity;
};

export const deleteOpportunity = async (id: string) => {
  const { data, error } = await supabase
    .from("opportunities")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    value: Number(data.expected_value || 0)
  } as Opportunity;
};
