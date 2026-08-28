import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDevBypass } from "@/lib/dev-bypass";
import { saveProfileAction } from "@/lib/actions/profile";
import { EMPLOYMENT_LABELS } from "@/lib/reps/constants";
import { AuthFrame } from "@/components/auth-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmploymentType } from "@/lib/types";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (isDevBypass()) redirect("/home");

  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  const params = await searchParams;

  if (
    profile?.legal_name &&
    profile?.real_estate_employment &&
    !params.error
  ) {
    redirect("/home");
  }

  return (
    <AuthFrame>
      <div className="grid gap-6">
        <div>
          <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            Listing sheet
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Set up your log
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Use the name that will appear on the tax return. How you work in
            real estate decides whether agent hours count toward REPS.
          </p>
        </div>
        {params.error && (
          <p className="text-destructive text-sm">{params.error}</p>
        )}
        <form action={saveProfileAction} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="legal_name">Legal name</Label>
            <Input
              id="legal_name"
              name="legal_name"
              required
              defaultValue={profile?.legal_name ?? ""}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="spouse_name">Spouse name (optional)</Label>
            <Input
              id="spouse_name"
              name="spouse_name"
              defaultValue={profile?.spouse_name ?? ""}
            />
          </div>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Real estate work</legend>
            {(Object.keys(EMPLOYMENT_LABELS) as EmploymentType[]).map(
              (value) => (
                <label
                  key={value}
                  className="flex items-start gap-3 rounded-xl bg-card p-3 text-sm ring-1 ring-rule/80"
                >
                  <input
                    type="radio"
                    name="real_estate_employment"
                    value={value}
                    required
                    defaultChecked={profile?.real_estate_employment === value}
                    className="mt-1"
                  />
                  <span>
                    {EMPLOYMENT_LABELS[value]}
                    {value === "w2_employee" && (
                      <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                        Those hours generally do not count toward the 750-hour
                        or 50% tests unless you own 5% of the brokerage.
                      </span>
                    )}
                  </span>
                </label>
              ),
            )}
          </fieldset>
          <Button type="submit" className="h-11 w-full">
            Save and continue
          </Button>
        </form>
      </div>
    </AuthFrame>
  );
}
