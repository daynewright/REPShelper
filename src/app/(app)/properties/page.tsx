import { loadWorkspace } from "@/lib/data";
import { PropertiesManager } from "@/components/properties-manager";
import { PageHeader } from "@/components/page-header";

export default async function PropertiesPage() {
  const { year, properties, usedPropertyIds, settings, flags, summary } =
    await loadWorkspace();
  return (
    <div className="grid gap-6">
      <PageHeader
        kicker="Material participation"
        title="Rentals"
        description="Material participation is per property unless you track them as grouped. Mark sold rentals inactive so past hours stay in your packet."
      />
      <PropertiesManager
        year={year}
        properties={properties}
        usedPropertyIds={usedPropertyIds}
        grouped={settings?.group_rental_activities ?? false}
        flags={flags}
        mp={summary.materialParticipation}
      />
    </div>
  );
}
