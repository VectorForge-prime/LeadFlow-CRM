import { supabase } from "./supabase";

export async function getTasks(userId) {
  if (!userId) {
    return {
      data: [],
      error: new Error("The authenticated user is missing."),
    };
  }

  return supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createTask(userId, task) {
  if (!userId) {
    return {
      data: null,
      error: new Error("The authenticated user is missing."),
    };
  }

  const completed = task.status === "Completed";

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      status: task.status,
      due_date: task.dueDate || null,
      assigned_to: task.assignedTo || "Unassigned",
      completed,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateTask(taskId, task) {
  if (!taskId) {
    return {
      data: null,
      error: new Error("The task ID is missing."),
    };
  }

  const completed = task.status === "Completed";

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      status: task.status,
      due_date: task.dueDate || null,
      assigned_to: task.assignedTo || "Unassigned",
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  return { data, error };
}

export async function updateTaskCompletion(
  taskId,
  completed
) {
  if (!taskId) {
    return {
      data: null,
      error: new Error("The task ID is missing."),
    };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed,
      status: completed ? "Completed" : "To Do",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  return { data, error };
}

export async function deleteTask(taskId) {
  if (!taskId) {
    return {
      error: new Error("The task ID is missing."),
    };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  return { error };
}