import { supabase } from "./supabase";

export async function getCustomers(userId) {
  if (!userId) {
    return {
      data: [],
      error: new Error("The authenticated user is missing."),
    };
  }

  return supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createCustomer(userId, customer) {
  if (!userId) {
    return {
      data: null,
      error: new Error("The authenticated user is missing."),
    };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || null,
      company: customer.company,
      status: customer.status,
      revenue: Number(customer.revenue) || 0,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateCustomer(customerId, customer) {
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || null,
      company: customer.company,
      status: customer.status,
      revenue: Number(customer.revenue) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .select()
    .single();

  return { data, error };
}

export async function deleteCustomer(customerId) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId);

  return { error };
}