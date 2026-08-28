import { buildYearSummary } from "./summary";
import type { Property, TimeEntry } from "../types";

const property: Property = {
  id: "p1",
  user_id: "u1",
  name: "12 Oak",
  address: null,
  archived_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

function entry(
  partial: Partial<TimeEntry> &
    Pick<TimeEntry, "category" | "duration_minutes" | "performer">,
): TimeEntry {
  return {
    id: crypto.randomUUID(),
    user_id: "u1",
    occurred_on: "2026-03-01",
    started_at: null,
    ended_at: null,
    property_id: partial.category === "rental" ? "p1" : null,
    activity_kind: null,
    notes: "Work",
    source: "manual",
    created_at: "2026-03-01T12:00:00.000Z",
    ...partial,
  };
}

const summary = buildYearSummary({
  year: 2026,
  employment: "independent",
  groupRental: false,
  properties: [property],
  flags: [],
  entries: [
    entry({
      category: "real_property_trade",
      performer: "taxpayer",
      duration_minutes: 600,
    }),
    entry({
      category: "rental",
      performer: "spouse",
      duration_minutes: 30_000,
    }),
    entry({
      category: "rental",
      performer: "taxpayer",
      duration_minutes: 60,
    }),
  ],
});

const checks: [string, boolean][] = [
  ["750 ignores spouse rental hours", summary.reps750.hours === 11],
  ["MP includes spouse hours", summary.materialParticipation[0]?.totalMinutes === 30_060],
  ["50% met when RE is only job", summary.reps50.met],
  ["other work unlogged flagged", summary.reps50.otherWorkUnlogged],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(summary);
  throw new Error(failed.map(([name]) => name).join(", "));
}
console.log("domain checks passed");
