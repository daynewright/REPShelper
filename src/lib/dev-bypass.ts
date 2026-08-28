import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { currentTaxYear, todayISO } from "@/lib/date";
import { buildYearSummary } from "@/lib/reps/summary";
import type {
  ActiveTimer,
  Category,
  ParticipationFlag,
  Performer,
  Profile,
  Property,
  TaxYearSettings,
  TimeEntry,
} from "@/lib/types";

/** Local-only UI bypass. Never enable in production. */
export function isDevBypass() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.REPS_DEV_BYPASS === "1"
  );
}

export const DEV_USER_ID = "00000000-0000-4000-8000-000000000001";
export const DEV_EMAIL = "dev@localhost";

const PROPERTY_OAK = "11111111-1111-4111-8111-111111111111";
const PROPERTY_PINE = "22222222-2222-4222-8222-222222222222";

/** File-backed so server actions and RSC share state in next dev. */
const STORE_PATH = join(process.cwd(), ".next", "reps-dev-store.json");

export type DevStore = {
  profile: Profile;
  properties: Property[];
  entries: TimeEntry[];
  timer: ActiveTimer | null;
  settingsByYear: Record<number, TaxYearSettings>;
  flags: ParticipationFlag[];
};

function id() {
  return crypto.randomUUID();
}

function seed(): DevStore {
  const year = currentTaxYear();
  const now = new Date().toISOString();
  const user_id = DEV_USER_ID;

  const properties: Property[] = [
    {
      id: PROPERTY_OAK,
      user_id,
      name: "12 Oak St",
      address: "12 Oak St",
      archived_at: null,
      created_at: now,
    },
    {
      id: PROPERTY_PINE,
      user_id,
      name: "88 Pine Ave",
      address: "88 Pine Ave",
      archived_at: null,
      created_at: now,
    },
  ];

  const entries: TimeEntry[] = [
    {
      id: id(),
      user_id,
      occurred_on: `${year}-01-15`,
      duration_minutes: 180,
      started_at: null,
      ended_at: null,
      category: "real_property_trade",
      property_id: null,
      performer: "taxpayer",
      activity_kind: "showing",
      notes: "Showed 3 listings on the east side; follow-ups with buyers",
      source: "manual",
      created_at: `${year}-01-15T18:00:00.000Z`,
    },
    {
      id: id(),
      user_id,
      occurred_on: `${year}-02-03`,
      duration_minutes: 240,
      started_at: null,
      ended_at: null,
      category: "real_property_trade",
      property_id: null,
      performer: "taxpayer",
      activity_kind: "negotiation",
      notes: "Offer review and counter on Maple listing",
      source: "manual",
      created_at: `${year}-02-03T20:00:00.000Z`,
    },
    {
      id: id(),
      user_id,
      occurred_on: `${year}-03-12`,
      duration_minutes: 120,
      started_at: null,
      ended_at: null,
      category: "rental",
      property_id: PROPERTY_OAK,
      performer: "taxpayer",
      activity_kind: "repairs",
      notes: "Met plumber at 12 Oak, replaced garbage disposal",
      source: "manual",
      created_at: `${year}-03-12T17:30:00.000Z`,
    },
    {
      id: id(),
      user_id,
      occurred_on: `${year}-04-08`,
      duration_minutes: 90,
      started_at: null,
      ended_at: null,
      category: "rental",
      property_id: PROPERTY_OAK,
      performer: "spouse",
      activity_kind: "tenant",
      notes: "Tenant walkthrough and lease renewal discussion",
      source: "manual",
      created_at: `${year}-04-08T16:00:00.000Z`,
    },
    {
      id: id(),
      user_id,
      occurred_on: `${year}-05-20`,
      duration_minutes: 300,
      started_at: null,
      ended_at: null,
      category: "real_property_trade",
      property_id: null,
      performer: "taxpayer",
      activity_kind: "open_house",
      notes: "Open house + prep, 2–5pm",
      source: "manual",
      created_at: `${year}-05-20T22:00:00.000Z`,
    },
    {
      id: id(),
      user_id,
      occurred_on: `${year}-06-02`,
      duration_minutes: 150,
      started_at: null,
      ended_at: null,
      category: "rental",
      property_id: PROPERTY_PINE,
      performer: "taxpayer",
      activity_kind: "management",
      notes: "Vendor bids for roof repair at 88 Pine",
      source: "manual",
      created_at: `${year}-06-02T19:00:00.000Z`,
    },
  ];

  // Pad agent hours so the 750 card looks mid-progress (~200 hrs)
  for (let i = 0; i < 20; i++) {
    const month = String(((i % 6) + 1)).padStart(2, "0");
    const day = String(10 + (i % 15)).padStart(2, "0");
    entries.push({
      id: id(),
      user_id,
      occurred_on: `${year}-${month}-${day}`,
      duration_minutes: 120 + (i % 3) * 30,
      started_at: null,
      ended_at: null,
      category: "real_property_trade",
      property_id: null,
      performer: "taxpayer",
      activity_kind: "client",
      notes: `Client work block ${i + 1}`,
      source: "manual",
      created_at: `${year}-${month}-${day}T18:00:00.000Z`,
    });
  }

  return {
    profile: {
      id: user_id,
      legal_name: "Jordan Ellis",
      spouse_name: "Alex Ellis",
      real_estate_employment: "independent",
      created_at: now,
      updated_at: now,
    },
    properties,
    entries,
    timer: null,
    settingsByYear: {
      [year]: {
        id: id(),
        user_id,
        year,
        group_rental_activities: false,
      },
    },
    flags: [],
  };
}

export function getDevStore(): DevStore {
  try {
    if (existsSync(STORE_PATH)) {
      return JSON.parse(readFileSync(STORE_PATH, "utf8")) as DevStore;
    }
  } catch {
    // Fall through and reseed.
  }
  const store = seed();
  persistDevStore(store);
  return store;
}

function persistDevStore(store: DevStore) {
  mkdirSync(join(process.cwd(), ".next"), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store));
}

function updateDevStore(mutate: (store: DevStore) => void) {
  const store = getDevStore();
  mutate(store);
  persistDevStore(store);
  return store;
}

export function loadDevWorkspace(year: number) {
  const store = getDevStore();
  const { start, end } = {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
  const entries = store.entries
    .filter((e) => e.occurred_on >= start && e.occurred_on <= end)
    .slice()
    .sort((a, b) => {
      if (a.occurred_on === b.occurred_on) {
        return b.created_at.localeCompare(a.created_at);
      }
      return b.occurred_on.localeCompare(a.occurred_on);
    });
  const settings = store.settingsByYear[year] ?? null;
  const flags = store.flags.filter((f) => f.year === year);
  const summary = buildYearSummary({
    year,
    entries,
    properties: store.properties,
    employment: store.profile.real_estate_employment,
    groupRental: settings?.group_rental_activities ?? false,
    flags,
  });

  return {
    userId: DEV_USER_ID,
    email: DEV_EMAIL,
    year,
    profile: store.profile,
    properties: store.properties,
    entries,
    timer: store.timer,
    settings,
    flags,
    summary,
  };
}

export function saveDevProfile(input: {
  legal_name: string;
  spouse_name: string | null;
  real_estate_employment: NonNullable<Profile["real_estate_employment"]>;
}) {
  updateDevStore((store) => {
    store.profile = {
      ...store.profile,
      ...input,
      updated_at: new Date().toISOString(),
    };
  });
}

export function startDevTimer(input: {
  category: Category;
  property_id: string | null;
  performer: Performer;
  activity_kind: string | null;
  notes: string | null;
}) {
  const store = getDevStore();
  if (store.timer) return { error: "A timer is already running. Stop it first." };
  updateDevStore((s) => {
    s.timer = {
      user_id: DEV_USER_ID,
      started_at: new Date().toISOString(),
      category: input.category,
      property_id: input.category === "rental" ? input.property_id : null,
      performer: input.performer,
      activity_kind: input.activity_kind,
      notes: input.notes,
    };
  });
  return { ok: true as const };
}

export function stopDevTimer(input: {
  notes: string;
  activity_kind: string | null;
}) {
  const store = getDevStore();
  if (!store.timer) return { error: "No timer is running." };
  const timer = store.timer;
  const ended = new Date();
  const started = new Date(timer.started_at);
  const duration_minutes = Math.max(
    1,
    Math.round((ended.getTime() - started.getTime()) / 60000),
  );
  updateDevStore((s) => {
    s.entries.unshift({
      id: id(),
      user_id: DEV_USER_ID,
      occurred_on: todayISO(started),
      duration_minutes,
      started_at: timer.started_at,
      ended_at: ended.toISOString(),
      category: timer.category,
      property_id: timer.property_id,
      performer: timer.performer,
      activity_kind: input.activity_kind || timer.activity_kind,
      notes: input.notes,
      source: "timer",
      created_at: ended.toISOString(),
    });
    s.timer = null;
  });
  return { ok: true as const };
}

export function cancelDevTimer() {
  updateDevStore((store) => {
    store.timer = null;
  });
  return { ok: true as const };
}

export function createDevEntry(input: Omit<TimeEntry, "id" | "user_id" | "created_at">) {
  updateDevStore((store) => {
    store.entries.unshift({
      ...input,
      id: id(),
      user_id: DEV_USER_ID,
      created_at: new Date().toISOString(),
    });
  });
  return { ok: true as const };
}

export function updateDevEntry(
  entryId: string,
  patch: Partial<
    Pick<
      TimeEntry,
      | "occurred_on"
      | "duration_minutes"
      | "category"
      | "property_id"
      | "performer"
      | "activity_kind"
      | "notes"
    >
  >,
) {
  const store = getDevStore();
  const idx = store.entries.findIndex((e) => e.id === entryId);
  if (idx < 0) return { error: "Entry not found." };
  updateDevStore((s) => {
    const i = s.entries.findIndex((e) => e.id === entryId);
    if (i >= 0) s.entries[i] = { ...s.entries[i], ...patch };
  });
  return { ok: true as const };
}

export function deleteDevEntry(entryId: string) {
  updateDevStore((store) => {
    store.entries = store.entries.filter((e) => e.id !== entryId);
  });
  return { ok: true as const };
}

export function createDevProperty(name: string, address: string | null) {
  updateDevStore((store) => {
    store.properties.push({
      id: id(),
      user_id: DEV_USER_ID,
      name,
      address,
      archived_at: null,
      created_at: new Date().toISOString(),
    });
  });
  return { ok: true as const };
}

export function updateDevProperty(
  propertyId: string,
  name: string,
  address: string | null,
) {
  const store = getDevStore();
  if (!store.properties.some((p) => p.id === propertyId)) {
    return { error: "Property not found." };
  }
  updateDevStore((s) => {
    const prop = s.properties.find((p) => p.id === propertyId);
    if (prop) {
      prop.name = name;
      prop.address = address;
    }
  });
  return { ok: true as const };
}

export function archiveDevProperty(propertyId: string, archived: boolean) {
  const store = getDevStore();
  if (!store.properties.some((p) => p.id === propertyId)) {
    return { error: "Property not found." };
  }
  updateDevStore((s) => {
    const prop = s.properties.find((p) => p.id === propertyId);
    if (prop) {
      prop.archived_at = archived ? new Date().toISOString() : null;
    }
  });
  return { ok: true as const };
}

export function setDevGrouping(year: number, grouped: boolean) {
  updateDevStore((store) => {
    const existing = store.settingsByYear[year];
    if (existing) {
      existing.group_rental_activities = grouped;
    } else {
      store.settingsByYear[year] = {
        id: id(),
        user_id: DEV_USER_ID,
        year,
        group_rental_activities: grouped,
      };
    }
  });
}

export function saveDevMpFlag(input: {
  year: number;
  property_id: string | null;
  test_code: ParticipationFlag["test_code"];
  claimed: boolean;
  note: string | null;
}) {
  updateDevStore((store) => {
    const idx = store.flags.findIndex(
      (f) =>
        f.year === input.year &&
        f.test_code === input.test_code &&
        f.property_id === input.property_id,
    );
    if (!input.claimed) {
      if (idx >= 0) store.flags.splice(idx, 1);
      return;
    }
    if (idx >= 0) {
      store.flags[idx] = {
        ...store.flags[idx],
        claimed: true,
        note: input.note,
      };
    } else {
      store.flags.push({
        id: id(),
        user_id: DEV_USER_ID,
        year: input.year,
        property_id: input.property_id,
        test_code: input.test_code,
        claimed: true,
        note: input.note,
      });
    }
  });
}
