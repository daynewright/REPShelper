import { loadWorkspace } from "@/lib/data";
import { InfoSheet } from "@/components/info-sheet";
import { LogForm } from "@/components/log-form";
import { PageHeader } from "@/components/page-header";

export default async function LogPage() {
  const { properties, entries } = await loadWorkspace();
  return (
    <div className="grid gap-6">
      <PageHeader
        kicker="Quick log"
        title="Log hours"
        description="Catch up later in the day. A specific description is what survives an audit."
        action={<InfoSheet topic="contemporaneous_log" label="Why log?" />}
      />
      <LogForm properties={properties} lastEntry={entries[0] ?? null} />
    </div>
  );
}
