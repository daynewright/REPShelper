import { loadWorkspace } from "@/lib/data";
import { ActivityList } from "@/components/activity-list";
import { InfoSheet } from "@/components/info-sheet";
import { LogFormSection } from "@/components/log-form-section";
import { PageHeader } from "@/components/page-header";

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const { properties, entries } = await loadWorkspace();
  const params = await searchParams;
  const openAdd = params.add === "1";
  const count = entries.length;

  return (
    <div className="grid gap-8">
      <PageHeader
        kicker="Contemporaneous log"
        title="Hours"
        description="Add a block when you weren’t on the timer, then review this year’s entries."
        action={<InfoSheet topic="contemporaneous_log" label="Why log?" />}
      />

      <LogFormSection
        properties={properties}
        lastEntry={entries[0] ?? null}
        defaultOpen={openAdd}
      />

      <section className="grid gap-3">
        <div className="grid gap-1">
          <h2 className="font-display text-lg font-semibold">This year</h2>
          <p className="text-muted-foreground text-sm">
            {count} {count === 1 ? "entry" : "entries"} in the selected tax year.
          </p>
        </div>
        <ActivityList entries={entries} properties={properties} />
      </section>
    </div>
  );
}
