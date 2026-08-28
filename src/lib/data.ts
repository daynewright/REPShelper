import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { currentTaxYear, yearBounds } from "@/lib/date";
import { requireUser } from "@/lib/auth";
import { isDevBypass, loadDevWorkspace } from "@/lib/dev-bypass";
import { buildYearSummary } from "@/lib/reps/summary";
import type {
  ActiveTimer,
  ParticipationFlag,
  Profile,
  Property,
  TaxYearSettings,
  TimeEntry,
} from "@/lib/types";

export const YEAR_COOKIE = "reps-year";

export async function getSelectedYear(): Promise<number> {
  const store = await cookies();
  const raw = store.get(YEAR_COOKIE)?.value;
  const year = raw ? Number(raw) : currentTaxYear();
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return currentTaxYear();
  }
  return year;
}

export async function loadWorkspace(year?: number) {
  const selectedYear = year ?? (await getSelectedYear());
  if (isDevBypass()) {
    noStore();
    return loadDevWorkspace(selectedYear);
  }

  const { supabase, userId, email } = await requireUser();
  const { start, end } = yearBounds(selectedYear);

  const [
    profileRes,
    propertiesRes,
    entriesRes,
    timerRes,
    settingsRes,
    flagsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("properties").select("*").eq("user_id", userId).order("name"),
    supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("occurred_on", start)
      .lte("occurred_on", end)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("active_timers").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("tax_year_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("year", selectedYear)
      .maybeSingle(),
    supabase
      .from("participation_flags")
      .select("*")
      .eq("user_id", userId)
      .eq("year", selectedYear),
  ]);

  const profile = (profileRes.data as Profile | null) ?? null;
  const properties = (propertiesRes.data as Property[] | null) ?? [];
  const entries = (entriesRes.data as TimeEntry[] | null) ?? [];
  const timer = (timerRes.data as ActiveTimer | null) ?? null;
  const settings = (settingsRes.data as TaxYearSettings | null) ?? null;
  const flags = (flagsRes.data as ParticipationFlag[] | null) ?? [];

  const summary = buildYearSummary({
    year: selectedYear,
    entries,
    properties,
    employment: profile?.real_estate_employment ?? null,
    groupRental: settings?.group_rental_activities ?? false,
    flags,
  });

  return {
    userId,
    email,
    year: selectedYear,
    profile,
    properties,
    entries,
    timer,
    settings,
    flags,
    summary,
  };
}

export function needsOnboarding(profile: Profile | null): boolean {
  if (!profile) return true;
  if (!profile.legal_name.trim()) return true;
  if (!profile.real_estate_employment) return true;
  return false;
}
