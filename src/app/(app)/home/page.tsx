import { loadWorkspace } from "@/lib/data";
import { InfoSheet } from "@/components/info-sheet";
import { StatusCards } from "@/components/status-cards";
import { TimerPanel } from "@/components/timer-panel";
import { W2Banner } from "@/components/w2-banner";
import { PageHeader } from "@/components/page-header";

export default async function HomePage() {
  const { summary, timer, properties, profile, year } = await loadWorkspace();

  return (
    <div className="grid gap-6">
      <PageHeader
        kicker={`Tax year ${year}`}
        title="This year"
        description="Three tests. Log as you go so the packet is contemporaneous."
        action={<InfoSheet topic="reps_overview" label="About REPS" />}
      />
      <W2Banner employment={profile?.real_estate_employment ?? null} />
      <TimerPanel timer={timer} properties={properties} />
      <StatusCards summary={summary} />
    </div>
  );
}
