import { loadWorkspace } from "@/lib/data";
import { ActivityList } from "@/components/activity-list";
import { PageHeader } from "@/components/page-header";

export default async function ActivityPage() {
  const { entries, properties } = await loadWorkspace();
  return (
    <div className="grid gap-6">
      <PageHeader
        kicker="Contemporaneous log"
        title="Activity"
        description={`${entries.length} ${entries.length === 1 ? "entry" : "entries"} this tax year.`}
      />
      <ActivityList entries={entries} properties={properties} />
    </div>
  );
}
