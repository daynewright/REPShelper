import Link from "next/link";
import { loadWorkspace, needsOnboarding } from "@/lib/data";
import { redirect } from "next/navigation";
import { PacketView } from "@/components/packet-view";
import { PrintButton } from "@/components/print-button";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { todayISO } from "@/lib/date";

export default async function PacketPage() {
  const workspace = await loadWorkspace();
  if (!workspace.profile || needsOnboarding(workspace.profile)) {
    redirect("/onboarding");
  }

  return (
    <div className="grid gap-5">
      <div className="no-print">
        <PageHeader
          kicker="Tax-time file"
          title="CPA packet"
          description="Print or save as PDF, and download the CSV for workpapers."
          action={
            <div className="flex gap-2">
              <PrintButton />
              <Button variant="outline" asChild>
                <Link href="/packet/csv">Download CSV</Link>
              </Button>
            </div>
          }
        />
      </div>
      <PacketView
        profile={workspace.profile}
        year={workspace.year}
        summary={workspace.summary}
        entries={workspace.entries}
        properties={workspace.properties}
        preparedOn={todayISO()}
      />
    </div>
  );
}
