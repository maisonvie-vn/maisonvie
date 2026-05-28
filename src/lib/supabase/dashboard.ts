import { supabase } from "./client";
import type { Opportunity, Task } from "../../types";

export const getDashboardStats = async ({
  userId = "",
  userRole = "sales",
}: {
  userId?: string;
  userRole?: string;
}) => {
  // 1. Calculate date ranges
  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  // 2. Query New Leads (created in last 7 days)
  let leadsQuery = supabase
    .from("leads")
    .select("id", { count: "exact" })
    .eq("is_active", true)
    .gte("created_at", sevenDaysAgo);

  if (userRole === "sales" && userId) {
    leadsQuery = leadsQuery.eq("assigned_to", userId);
  }
  const { count: newLeadsCount } = await leadsQuery;

  // 3. Query Open Opportunities
  let oppsQuery = supabase
    .from("opportunities")
    .select("id, value", { count: "exact" })
    .eq("is_active", true)
    .is("closed_at", null);

  if (userRole === "sales" && userId) {
    oppsQuery = oppsQuery.eq("assigned_to", userId);
  }
  const { data: openOpps, count: openOppsCount } = await oppsQuery;

  const pipelineValue = (openOpps || []).reduce(
    (sum, opp) => sum + (opp.value || 0),
    0,
  );

  // 4. Query Monthly Completed Revenue (from subscriptions table)
  let revQuery = supabase
    .from("subscriptions")
    .select("amount")
    .eq("payment_status", "completed")
    .gte("created_at", firstDayOfMonth);

  if (userRole === "sales" && userId) {
    revQuery = revQuery.eq("recorded_by", userId);
  }
  const { data: monthlyRevenueData } = await revQuery;

  const monthlyRevenue = (monthlyRevenueData || []).reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  // 5. Query Recent 5 Opportunities
  let recentOppsQuery = supabase
    .from("opportunities")
    .select("*, leads(full_name, phone_primary)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  if (userRole === "sales" && userId) {
    recentOppsQuery = recentOppsQuery.eq("assigned_to", userId);
  }
  const { data: recentOpps } = await recentOppsQuery;

  // 6. Query Today's Tasks
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  ).toISOString();
  let todayTasksQuery = supabase
    .from("tasks")
    .select("*, leads(full_name)")
    .lte("due_date", todayEnd)
    .neq("status", "completed")
    .order("priority", { ascending: false })
    .limit(5);

  if (userRole === "sales" && userId) {
    todayTasksQuery = todayTasksQuery.eq("assigned_to", userId);
  }
  const { data: todayTasks } = await todayTasksQuery;

  // 7. Opportunities Stage distribution for Recharts
  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("id, name")
    .order("sort_order", { ascending: true });

  let distQuery = supabase
    .from("opportunities")
    .select("stage_id, value")
    .eq("is_active", true);

  if (userRole === "sales" && userId) {
    distQuery = distQuery.eq("assigned_to", userId);
  }
  const { data: allOppsDistribution } = await distQuery;

  const stageChartData = (stages || []).map((stage) => {
    const oppsInStage = (allOppsDistribution || []).filter(
      (o) => o.stage_id === stage.id,
    );
    return {
      name: stage.name,
      count: oppsInStage.length,
      value: oppsInStage.reduce((sum, o) => sum + (o.value || 0), 0),
    };
  });

  return {
    metrics: {
      newLeads: newLeadsCount || 0,
      openOpportunities: openOppsCount || 0,
      pipelineValue,
      monthlyRevenue,
    },
    recentOpportunities: (recentOpps || []) as (Opportunity & {
      leads: { full_name: string; phone_primary: string };
    })[],
    todayTasks: (todayTasks || []) as (Task & {
      leads: { full_name: string } | null;
    })[],
    stageDistribution: stageChartData,
  };
};
