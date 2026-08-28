import { loadWorkspace } from "@/lib/data";
import { saveProfileAction } from "@/lib/actions/profile";
import { EMPLOYMENT_LABELS } from "@/lib/reps/constants";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmploymentType } from "@/lib/types";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await loadWorkspace();
  const params = await searchParams;

  return (
    <div className="grid gap-6">
      <PageHeader
        kicker="Taxpayer details"
        title="Settings"
        description="These details print on the CPA packet."
      />
      {params.error && (
        <p className="text-destructive text-sm">{params.error}</p>
      )}
      <form
        action={saveProfileAction}
        className="bg-card grid max-w-md gap-4 rounded-xl p-5 ring-1 ring-rule/80"
      >
        <input type="hidden" name="next" value="/settings" />
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
          <Label htmlFor="spouse_name">Spouse name</Label>
          <Input
            id="spouse_name"
            name="spouse_name"
            defaultValue={profile?.spouse_name ?? ""}
          />
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Real estate work</legend>
          {(Object.keys(EMPLOYMENT_LABELS) as EmploymentType[]).map((value) => (
            <label
              key={value}
              className="flex items-start gap-3 rounded-xl bg-fog/60 p-3 text-sm ring-1 ring-rule/70"
            >
              <input
                type="radio"
                name="real_estate_employment"
                value={value}
                required
                defaultChecked={profile?.real_estate_employment === value}
                className="mt-1"
              />
              {EMPLOYMENT_LABELS[value]}
            </label>
          ))}
        </fieldset>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
