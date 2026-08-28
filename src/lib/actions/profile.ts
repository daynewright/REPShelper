"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDevBypass, saveDevProfile } from "@/lib/dev-bypass";
import type { EmploymentType } from "@/lib/types";

const EMPLOYMENT: EmploymentType[] = [
  "independent",
  "owner_5pct",
  "w2_employee",
];

export async function saveProfileAction(formData: FormData) {
  const legal_name = String(formData.get("legal_name") ?? "").trim();
  const spouse_name = String(formData.get("spouse_name") ?? "").trim() || null;
  const real_estate_employment = String(
    formData.get("real_estate_employment") ?? "",
  ) as EmploymentType;
  const next = String(formData.get("next") ?? "/home");
  const errorBase = next.startsWith("/settings") ? "/settings" : "/onboarding";

  if (!legal_name) {
    redirect(`${errorBase}?error=Legal+name+is+required`);
  }
  if (!EMPLOYMENT.includes(real_estate_employment)) {
    redirect(`${errorBase}?error=Choose+how+you+work+in+real+estate`);
  }

  if (isDevBypass()) {
    saveDevProfile({ legal_name, spouse_name, real_estate_employment });
    revalidatePath("/", "layout");
    redirect(next.startsWith("/") ? next : "/home");
  }

  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    legal_name,
    spouse_name,
    real_estate_employment,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    redirect(`${errorBase}?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/home");
}
