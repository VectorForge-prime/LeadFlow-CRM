import { supabase } from "./supabase";

export async function getLeads(userId) {
  if (!userId) {
    return {
      data: [],
      error: new Error("The authenticated user is missing."),
    };
  }

  return supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createLead(userId, lead) {
  if (!userId) {
    return {
      data: null,
      error: new Error("The authenticated user is missing."),
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: userId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      company: lead.company,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      value: Number(lead.value) || 0,
      assigned_to: lead.assignedTo || "Unassigned",
    })
    .select()
    .single();

  return { data, error };
}

export async function updateLead(leadId, lead) {
  if (!leadId) {
    return {
      data: null,
      error: new Error("The lead ID is missing."),
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      company: lead.company,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      value: Number(lead.value) || 0,
      assigned_to: lead.assignedTo || "Unassigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select()
    .single();

  return { data, error };
}

export async function updateLeadStatus(leadId, status) {
  if (!leadId) {
    return {
      data: null,
      error: new Error("The lead ID is missing."),
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .select()
    .single();

  return { data, error };
}

export async function deleteLead(leadId) {
  if (!leadId) {
    return {
      error: new Error("The lead ID is missing."),
    };
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId);

  return { error };
}