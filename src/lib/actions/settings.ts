"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { getSelectedYear, YEAR_COOKIE } from "@/lib/data";
import { isDevBypass, saveDevMpFlag, setDevGrouping } from "@/lib/dev-bypass";
import type { MpTestCode } from "@/lib/types";

export async function setYearAction(formData: FormData) {
  const year = Number(formData.get("year"));
  if (!Number.isFinite(year) || year < 2000 || year > 2100) return;
  const store = await cookies();
  store.set(YEAR_COOKIE, String(year), {
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  revalidatePath("/", "layout");
}

export async function setGroupingAction(formData: FormData) {
  const year = Number(formData.get("year") ?? (await getSelectedYear()));
  const grouped = formData.get("grouped") === "on";
  if (isDevBypass()) {
    setDevGrouping(year, grouped);
    revalidatePath("/", "layout");
    return;
  }
  const { supabase, userId } = await requireUser();
  const { data: existing } = await supabase
    .from("tax_year_settings")
    .select("id")
    .eq("user_id", userId)
    .eq("year", year)
    .maybeSingle();
  if (existing?.id) {
    await supabase
      .from("tax_year_settings")
      .update({ group_rental_activities: grouped })
      .eq("id", existing.id)
      .eq("user_id", userId);
  } else {
    await supabase.from("tax_year_settings").insert({
      user_id: userId,
      year,
      group_rental_activities: grouped,
    });
  }
  revalidatePath("/", "layout");
}

export async function saveMpFlagAction(formData: FormData) {
  const year = Number(formData.get("year"));
  const test_code = String(formData.get("test_code")) as MpTestCode;
  const propertyRaw = String(formData.get("property_id") ?? "");
  const property_id = propertyRaw || null;
  const claimed = formData.get("claimed") === "on";
  const note = String(formData.get("note") ?? "").trim() || null;

  if (isDevBypass()) {
    saveDevMpFlag({ year, property_id, test_code, claimed, note });
    revalidatePath("/properties");
    revalidatePath("/packet");
    revalidatePath("/home");
    return;
  }

  const { supabase, userId } = await requireUser();
  const query = supabase
    .from("participation_flags")
    .select("id")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("test_code", test_code);
  const existing = property_id
    ? await query.eq("property_id", property_id).maybeSingle()
    : await query.is("property_id", null).maybeSingle();

  if (!claimed && existing.data?.id) {
    await supabase
      .from("participation_flags")
      .delete()
      .eq("id", existing.data.id)
      .eq("user_id", userId);
  } else if (claimed && existing.data?.id) {
    await supabase
      .from("participation_flags")
      .update({ claimed: true, note })
      .eq("id", existing.data.id)
      .eq("user_id", userId);
  } else if (claimed) {
    await supabase.from("participation_flags").insert({
      user_id: userId,
      year,
      property_id,
      test_code,
      claimed: true,
      note,
    });
  }
  revalidatePath("/properties");
  revalidatePath("/packet");
  revalidatePath("/home");
}
