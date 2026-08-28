import { monthKey, weeksRemainingInYear } from "@/lib/date";
import {
  MP_HOUR_THRESHOLD,
  MP_TESTS,
  REPS_HOUR_THRESHOLD,
} from "@/lib/reps/constants";
import type {
  EmploymentType,
  ParticipationFlag,
  Property,
  TimeEntry,
} from "@/lib/types";

export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

export function formatHours(minutes: number): string {
  return minutesToHours(minutes).toFixed(2);
}

export function agentHoursCountTowardReps(
  employment: EmploymentType | null,
): boolean {
  return employment === "independent" || employment === "owner_5pct";
}

export function taxpayerPersonalMinutes(entry: TimeEntry): number {
  if (entry.performer === "spouse") return 0;
  return entry.duration_minutes;
}

export function repsNumeratorMinutes(
  entry: TimeEntry,
  employment: EmploymentType | null,
): number {
  if (entry.performer === "spouse") return 0;
  if (entry.category === "other_work") return 0;
  if (entry.category === "rental") return entry.duration_minutes;
  if (entry.category === "real_property_trade") {
    return agentHoursCountTowardReps(employment) ? entry.duration_minutes : 0;
  }
  return 0;
}

export function rentalMpMinutes(entry: TimeEntry): number {
  if (entry.category !== "rental") return 0;
  return entry.duration_minutes;
}

export type MpActivitySummary = {
  propertyId: string | null;
  name: string;
  taxpayerMinutes: number;
  spouseMinutes: number;
  totalMinutes: number;
  met500: boolean;
  otherTests: { code: string; label: string; note: string | null }[];
};

export type YearSummary = {
  year: number;
  employment: EmploymentType | null;
  grouped: boolean;
  reps750: {
    minutes: number;
    hours: number;
    threshold: number;
    met: boolean;
    remainingHours: number;
  };
  reps50: {
    numeratorMinutes: number;
    denominatorMinutes: number;
    percent: number | null;
    met: boolean;
    otherWorkMinutes: number;
    otherWorkUnlogged: boolean;
    w2AgentMinutesExcluded: number;
  };
  materialParticipation: MpActivitySummary[];
  categoryMinutes: {
    real_property_trade: number;
    rental_taxpayer: number;
    rental_spouse: number;
    other_work: number;
  };
  lateLogCount: number;
  weeklyPaceHours: number | null;
  entryCount: number;
};

export function buildYearSummary(input: {
  year: number;
  entries: TimeEntry[];
  properties: Property[];
  employment: EmploymentType | null;
  groupRental: boolean;
  flags: ParticipationFlag[];
  now?: Date;
}): YearSummary {
  const {
    year,
    entries,
    properties,
    employment,
    groupRental,
    flags,
    now = new Date(),
  } = input;

  let numerator = 0;
  let denominator = 0;
  let otherWork = 0;
  let w2Excluded = 0;
  let lateLogCount = 0;
  const categoryMinutes = {
    real_property_trade: 0,
    rental_taxpayer: 0,
    rental_spouse: 0,
    other_work: 0,
  };

  const rentalByProperty = new Map<
    string,
    { taxpayer: number; spouse: number }
  >();

  for (const entry of entries) {
    const personal = taxpayerPersonalMinutes(entry);
    const num = repsNumeratorMinutes(entry, employment);
    numerator += num;
    denominator += personal;
    if (entry.category === "other_work" && entry.performer === "taxpayer") {
      otherWork += entry.duration_minutes;
    }
    if (
      entry.category === "real_property_trade" &&
      entry.performer === "taxpayer" &&
      !agentHoursCountTowardReps(employment)
    ) {
      w2Excluded += entry.duration_minutes;
    }
    if (entry.created_at.slice(0, 10) > entry.occurred_on) lateLogCount += 1;

    if (entry.category === "real_property_trade" && entry.performer === "taxpayer") {
      categoryMinutes.real_property_trade += entry.duration_minutes;
    } else if (entry.category === "rental") {
      if (entry.performer === "spouse") {
        categoryMinutes.rental_spouse += entry.duration_minutes;
      } else {
        categoryMinutes.rental_taxpayer += entry.duration_minutes;
      }
    } else if (entry.category === "other_work") {
      categoryMinutes.other_work += entry.duration_minutes;
    }

    if (entry.category === "rental" && entry.property_id) {
      const row = rentalByProperty.get(entry.property_id) ?? {
        taxpayer: 0,
        spouse: 0,
      };
      if (entry.performer === "spouse") row.spouse += entry.duration_minutes;
      else row.taxpayer += entry.duration_minutes;
      rentalByProperty.set(entry.property_id, row);
    }
  }

  const percent =
    denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : null;
  const hours750 = minutesToHours(numerator);
  const remaining750 = Math.max(REPS_HOUR_THRESHOLD - hours750, 0);
  const weeksLeft = weeksRemainingInYear(year, now);
  const weeklyPaceHours =
    remaining750 > 0 && weeksLeft > 0
      ? Math.round((remaining750 / weeksLeft) * 10) / 10
      : remaining750 === 0
        ? 0
        : null;

  const testsFor = (propertyId: string | null) =>
    flags
      .filter((f) => f.claimed && (f.property_id ?? null) === propertyId)
      .map((f) => ({
        code: f.test_code,
        label: MP_TESTS.find((t) => t.code === f.test_code)?.label ?? f.test_code,
        note: f.note,
      }));

  let materialParticipation: MpActivitySummary[];
  if (groupRental) {
    let taxpayer = 0;
    let spouse = 0;
    for (const row of rentalByProperty.values()) {
      taxpayer += row.taxpayer;
      spouse += row.spouse;
    }
    const total = taxpayer + spouse;
    materialParticipation = [
      {
        propertyId: null,
        name: "All rental real estate (grouped)",
        taxpayerMinutes: taxpayer,
        spouseMinutes: spouse,
        totalMinutes: total,
        met500: total >= MP_HOUR_THRESHOLD * 60,
        otherTests: testsFor(null),
      },
    ];
  } else {
    const active = properties.filter((p) => !p.archived_at);
    const ids = new Set([
      ...active.map((p) => p.id),
      ...rentalByProperty.keys(),
    ]);
    materialParticipation = [...ids].map((id) => {
      const prop = properties.find((p) => p.id === id);
      const row = rentalByProperty.get(id) ?? { taxpayer: 0, spouse: 0 };
      const total = row.taxpayer + row.spouse;
      return {
        propertyId: id,
        name: prop?.name ?? "Unknown property",
        taxpayerMinutes: row.taxpayer,
        spouseMinutes: row.spouse,
        totalMinutes: total,
        met500: total >= MP_HOUR_THRESHOLD * 60,
        otherTests: testsFor(id),
      };
    });
  }

  return {
    year,
    employment,
    grouped: groupRental,
    reps750: {
      minutes: numerator,
      hours: hours750,
      threshold: REPS_HOUR_THRESHOLD,
      met: hours750 >= REPS_HOUR_THRESHOLD,
      remainingHours: remaining750,
    },
    reps50: {
      numeratorMinutes: numerator,
      denominatorMinutes: denominator,
      percent,
      met: percent !== null && percent > 50,
      otherWorkMinutes: otherWork,
      otherWorkUnlogged: otherWork === 0,
      w2AgentMinutesExcluded: w2Excluded,
    },
    materialParticipation,
    categoryMinutes,
    lateLogCount,
    weeklyPaceHours,
    entryCount: entries.length,
  };
}

export function groupEntriesByMonth(entries: TimeEntry[]) {
  const map = new Map<string, TimeEntry[]>();
  for (const entry of [...entries].sort((a, b) =>
    a.occurred_on.localeCompare(b.occurred_on),
  )) {
    const key = monthKey(entry.occurred_on);
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return [...map.entries()];
}
