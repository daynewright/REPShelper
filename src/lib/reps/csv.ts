import { CATEGORY_LABELS, activityLabel } from "@/lib/reps/constants";
import { formatHours } from "@/lib/reps/summary";
import { isoToHhmm } from "@/lib/date";
import type { Property, TimeEntry } from "@/lib/types";

export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function entriesToCsv(
  entries: TimeEntry[],
  properties: Property[],
): string {
  const header = [
    "date",
    "start",
    "end",
    "hours",
    "who",
    "category",
    "property",
    "activity",
    "description",
    "source",
    "logged_at",
  ];
  const rows = [...entries]
    .sort((a, b) => a.occurred_on.localeCompare(b.occurred_on))
    .map((entry) => {
      const property =
        properties.find((p) => p.id === entry.property_id)?.name ?? "";
      return [
        entry.occurred_on,
        isoToHhmm(entry.started_at),
        isoToHhmm(entry.ended_at),
        formatHours(entry.duration_minutes),
        entry.performer,
        CATEGORY_LABELS[entry.category],
        property,
        activityLabel(entry.category, entry.activity_kind),
        entry.notes,
        entry.source,
        entry.created_at,
      ].map(csvEscape);
    });
  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
