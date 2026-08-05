import { supabase } from "./supabase";

export async function getEvents(userId) {
  if (!userId) {
    return {
      data: [],
      error: new Error("The authenticated user is missing."),
    };
  }

  return supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });
}

export async function createEvent(userId, calendarEvent) {
  if (!userId) {
    return {
      data: null,
      error: new Error("The authenticated user is missing."),
    };
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: userId,
      title: calendarEvent.title,
      event_date: calendarEvent.date,
      event_time: calendarEvent.time || null,
      event_type: calendarEvent.type,
      customer: calendarEvent.customer || null,
      location: calendarEvent.location || null,
      notes: calendarEvent.notes || null,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateEvent(eventId, calendarEvent) {
  if (!eventId) {
    return {
      data: null,
      error: new Error("The event ID is missing."),
    };
  }

  const { data, error } = await supabase
    .from("events")
    .update({
      title: calendarEvent.title,
      event_date: calendarEvent.date,
      event_time: calendarEvent.time || null,
      event_type: calendarEvent.type,
      customer: calendarEvent.customer || null,
      location: calendarEvent.location || null,
      notes: calendarEvent.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select()
    .single();

  return { data, error };
}

export async function deleteEvent(eventId) {
  if (!eventId) {
    return {
      error: new Error("The event ID is missing."),
    };
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  return { error };
}