import { supabase } from "./supabase";

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function prepareLeadData(lead) {
  return {
    name: lead.name?.trim() || "",
    company: lead.company?.trim() || "",
    email: lead.email?.trim() || "",
    phone: lead.phone?.trim() || null,

    deal_title: lead.dealTitle?.trim() || null,
    job_title: lead.jobTitle?.trim() || null,
    website: lead.website?.trim() || null,
    linkedin: lead.linkedin?.trim() || null,
    city: lead.city?.trim() || null,
    country: lead.country?.trim() || null,

    source: lead.source || "Website",
    status: lead.status || "New",
    priority: lead.priority || "Medium",

    value: Number(lead.value) || 0,
    currency: lead.currency || "EUR",
    probability: Number(lead.probability) || 0,

    expected_close_date: lead.expectedCloseDate || null,

    next_follow_up: lead.nextFollowUp
      ? new Date(lead.nextFollowUp).toISOString()
      : null,

    assigned_to: lead.assignedTo?.trim() || "Unassigned",
    tags: normalizeTags(lead.tags),
    notes: lead.notes?.trim() || null,
  };
}

export async function getLeads(userId) {
  if (!userId) {
    return {
      data: [],
      error: new Error("The authenticated user is missing."),
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: data || [],
    error,
  };
}

export async function createLead(userId, lead) {
  if (!userId) {
    return {
      data: null,
      error: new Error("The authenticated user is missing."),
    };
  }

  const leadData = prepareLeadData(lead);

  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: userId,
      ...leadData,
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

  const leadData = prepareLeadData(lead);

  const { data, error } = await supabase
    .from("leads")
    .update({
      ...leadData,
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