"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  archiveDevProperty,
  createDevProperty,
  deleteDevProperty,
  isDevBypass,
  updateDevProperty,
} from "@/lib/dev-bypass";

type ActionResult = { ok?: boolean; error?: string };

export async function createPropertyAction(
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  if (!name) return { error: "Name is required" };
  if (isDevBypass()) {
    createDevProperty(name, address);
    revalidatePath("/", "layout");
    return { ok: true };
  }
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("properties").insert({
    user_id: userId,
    name,
    address,
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePropertyAction(
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  if (!id || !name) return { error: "Name is required" };
  if (isDevBypass()) {
    const result = updateDevProperty(id, name, address);
    if ("error" in result) return result;
    revalidatePath("/", "layout");
    return { ok: true };
  }
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("properties")
    .update({ name, address })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function archivePropertyAction(
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const archived = formData.get("archived") === "1";
  if (isDevBypass()) {
    const result = archiveDevProperty(id, archived);
    if ("error" in result) return result;
    revalidatePath("/", "layout");
    return { ok: true };
  }
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("properties")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deletePropertyAction(
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Property not found." };
  if (isDevBypass()) {
    const result = deleteDevProperty(id);
    if ("error" in result) return result;
    revalidatePath("/", "layout");
    return { ok: true };
  }
  const { supabase, userId } = await requireUser();

  const [{ count: entryCount, error: entryError }, { data: timer, error: timerError }] =
    await Promise.all([
      supabase
        .from("time_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("property_id", id),
      supabase
        .from("active_timers")
        .select("property_id")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  if (entryError) return { error: entryError.message };
  if (timerError) return { error: timerError.message };
  if ((entryCount ?? 0) > 0) {
    return {
      error:
        "This rental has logged hours. Mark it inactive instead of deleting.",
    };
  }
  if (timer?.property_id === id) {
    return { error: "Stop the active timer on this rental before deleting." };
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
