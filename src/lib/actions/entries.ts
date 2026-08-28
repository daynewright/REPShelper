"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  cancelDevTimer,
  createDevEntry,
  deleteDevEntry,
  isDevBypass,
  startDevTimer,
  stopDevTimer,
  updateDevEntry,
} from "@/lib/dev-bypass";
import { timeToIsoOnDate, todayISO } from "@/lib/date";
import type { Category, Performer } from "@/lib/types";

type ActionResult = { ok?: boolean; error?: string };

const CATEGORIES: Category[] = [
  "real_property_trade",
  "rental",
  "other_work",
];

function parseCategory(value: string): Category | null {
  return CATEGORIES.includes(value as Category) ? (value as Category) : null;
}

function parseEntryFields(formData: FormData) {
  const category = parseCategory(String(formData.get("category") ?? ""));
  const rawPropertyId =
    String(formData.get("property_id") ?? "").trim() || null;
  const performer =
    String(formData.get("performer") ?? "taxpayer") === "spouse"
      ? ("spouse" as Performer)
      : ("taxpayer" as Performer);
  const activity_kind =
    String(formData.get("activity_kind") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim();
  // Forms keep a property selection around; only rental work may carry it.
  const property_id = category === "rental" ? rawPropertyId : null;
  return { category, property_id, performer, activity_kind, notes };
}

function validateShape(input: {
  category: Category | null;
  property_id: string | null;
  performer: Performer;
  notes: string;
}): string | null {
  if (!input.category) return "Choose what kind of work this was.";
  if (!input.notes) return "Add a short description of what you did.";
  if (input.category === "rental" && !input.property_id) {
    return "Pick which rental this work was on.";
  }
  if (input.category !== "rental" && input.property_id) {
    return "Only rental work is tied to a property.";
  }
  if (input.performer === "spouse" && input.category !== "rental") {
    return "Spouse hours can only be logged on rental work.";
  }
  return null;
}

export async function startTimerAction(
  formData: FormData,
): Promise<ActionResult> {
  const fields = parseEntryFields(formData);
  const notes = fields.notes || "In progress";
  const error = validateShape({ ...fields, notes });
  if (error) return { error };
  if (!fields.category) return { error: "Choose a category." };

  if (isDevBypass()) {
    const result = startDevTimer({
      category: fields.category,
      property_id: fields.property_id,
      performer: fields.performer,
      activity_kind: fields.activity_kind,
      notes: fields.notes || null,
    });
    if (result.error) return { error: result.error };
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const { supabase, userId } = await requireUser();
  const { data: existing } = await supabase
    .from("active_timers")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return { error: "A timer is already running. Stop it first." };

  const { error: insertError } = await supabase.from("active_timers").insert({
    user_id: userId,
    started_at: new Date().toISOString(),
    category: fields.category,
    property_id: fields.category === "rental" ? fields.property_id : null,
    performer: fields.performer,
    activity_kind: fields.activity_kind,
    notes: fields.notes || null,
  });
  if (insertError) return { error: insertError.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function stopTimerAction(
  formData: FormData,
): Promise<ActionResult> {
  const notes = String(formData.get("notes") ?? "").trim();
  const activity_kind =
    String(formData.get("activity_kind") ?? "").trim() || null;
  if (!notes) return { error: "Add a short description of what you did." };

  if (isDevBypass()) {
    const result = stopDevTimer({ notes, activity_kind });
    if ("error" in result) return result;
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const { supabase, userId } = await requireUser();
  const { data: timer, error: timerError } = await supabase
    .from("active_timers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (timerError || !timer) return { error: "No timer is running." };

  const ended = new Date();
  const started = new Date(timer.started_at);
  const duration_minutes = Math.max(
    1,
    Math.round((ended.getTime() - started.getTime()) / 60000),
  );

  const { error: insertError } = await supabase.from("time_entries").insert({
    user_id: userId,
    occurred_on: todayISO(started),
    duration_minutes,
    started_at: timer.started_at,
    ended_at: ended.toISOString(),
    category: timer.category,
    property_id: timer.property_id,
    performer: timer.performer,
    activity_kind: activity_kind || timer.activity_kind,
    notes,
    source: "timer",
  });
  if (insertError) return { error: insertError.message };

  await supabase.from("active_timers").delete().eq("user_id", userId);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function cancelTimerAction(): Promise<ActionResult> {
  if (isDevBypass()) {
    cancelDevTimer();
    revalidatePath("/", "layout");
    return { ok: true };
  }
  const { supabase, userId } = await requireUser();
  await supabase.from("active_timers").delete().eq("user_id", userId);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createEntryAction(
  formData: FormData,
): Promise<ActionResult> {
  const fields = parseEntryFields(formData);
  const occurred_on = String(formData.get("occurred_on") ?? todayISO());
  const hoursRaw = String(formData.get("hours") ?? "").trim();
  const start = String(formData.get("start_time") ?? "").trim();
  const end = String(formData.get("end_time") ?? "").trim();

  const shapeError = validateShape(fields);
  if (shapeError) return { error: shapeError };
  if (!fields.category) return { error: "Choose a category." };

  let duration_minutes = 0;
  let started_at: string | null = null;
  let ended_at: string | null = null;

  if (start && end) {
    started_at = timeToIsoOnDate(occurred_on, start);
    ended_at = timeToIsoOnDate(occurred_on, end);
    if (!started_at || !ended_at) return { error: "Invalid start or end time." };
    const diff = new Date(ended_at).getTime() - new Date(started_at).getTime();
    if (diff <= 0) return { error: "End time must be after start time." };
    duration_minutes = Math.max(1, Math.round(diff / 60000));
  } else if (hoursRaw) {
    const hours = Number(hoursRaw);
    if (!Number.isFinite(hours) || hours <= 0) {
      return { error: "Enter hours greater than 0." };
    }
    duration_minutes = Math.max(1, Math.round(hours * 60));
  } else {
    return { error: "Enter hours or a start and end time." };
  }

  const row = {
    occurred_on,
    duration_minutes,
    started_at,
    ended_at,
    category: fields.category,
    property_id: fields.category === "rental" ? fields.property_id : null,
    performer: fields.performer,
    activity_kind: fields.activity_kind,
    notes: fields.notes,
    source: "manual" as const,
  };

  if (isDevBypass()) {
    createDevEntry(row);
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("time_entries").insert({
    user_id: userId,
    ...row,
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateEntryAction(
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const fields = parseEntryFields(formData);
  const occurred_on = String(formData.get("occurred_on") ?? todayISO());
  const hoursRaw = String(formData.get("hours") ?? "").trim();
  const shapeError = validateShape(fields);
  if (!id) return { error: "Missing entry." };
  if (shapeError) return { error: shapeError };
  if (!fields.category) return { error: "Choose a category." };
  const hours = Number(hoursRaw);
  if (!Number.isFinite(hours) || hours <= 0) {
    return { error: "Enter hours greater than 0." };
  }

  const patch = {
    occurred_on,
    duration_minutes: Math.max(1, Math.round(hours * 60)),
    category: fields.category,
    property_id: fields.category === "rental" ? fields.property_id : null,
    performer: fields.performer,
    activity_kind: fields.activity_kind,
    notes: fields.notes,
  };

  if (isDevBypass()) {
    const result = updateDevEntry(id, patch);
    if ("error" in result) return result;
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("time_entries")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteEntryAction(
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing entry." };
  if (isDevBypass()) {
    deleteDevEntry(id);
    revalidatePath("/", "layout");
    return { ok: true };
  }
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
