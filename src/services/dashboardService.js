import { supabase } from "./supabase";

export async function getDashboardData(userId) {
  if (!userId) {
    return {
      data: null,
      error: new Error("The authenticated user is missing."),
    };
  }

  const [
    customersResult,
    leadsResult,
    tasksResult,
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId),

    supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId),

    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId),
  ]);

  const error =
    customersResult.error ||
    leadsResult.error ||
    tasksResult.error;

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data: {
      customers: customersResult.data ?? [],
      leads: leadsResult.data ?? [],
      tasks: tasksResult.data ?? [],
    },
    error: null,
  };
}