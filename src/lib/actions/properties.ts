"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  archiveDevProperty,
  createDevProperty,
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
