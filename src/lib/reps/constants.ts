import type { Category, EmploymentType, MpTestCode } from "@/lib/types";

export const REPS_HOUR_THRESHOLD = 750;
export const MP_HOUR_THRESHOLD = 500;

export const CATEGORY_LABELS: Record<Category, string> = {
  real_property_trade: "Agent / brokerage",
  rental: "Rental property",
  other_work: "Other job",
};

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  independent: "1099 / self-employed",
  owner_5pct: "Owner (5%+) of the brokerage",
  w2_employee: "W-2 employee (not a 5% owner)",
};

export const PERFORMER_LABELS = {
  taxpayer: "Taxpayer",
  spouse: "Spouse",
} as const;

export const NON_COUNTING_ACTIVITY_KINDS = [
  "investor_review",
  "research_deals",
  "commute",
  "on_call",
] as const;

export const ACTIVITY_KINDS: Record<
  Category,
  { value: string; label: string; warn?: boolean }[]
> = {
  real_property_trade: [
    { value: "showing", label: "Showing" },
    { value: "listing", label: "Listing / marketing" },
    { value: "client_meeting", label: "Client meeting" },
    { value: "open_house", label: "Open house" },
    { value: "negotiation", label: "Negotiation / offer" },
    { value: "paperwork", label: "Contracts / paperwork" },
    { value: "other", label: "Other agent work" },
    { value: "commute", label: "Commute", warn: true },
    { value: "on_call", label: "On-call / waiting", warn: true },
    { value: "research_deals", label: "Researching deals", warn: true },
  ],
  rental: [
    { value: "repairs", label: "Repairs" },
    { value: "maintenance", label: "Maintenance" },
    { value: "tenant_call", label: "Tenant call / email" },
    { value: "inspection", label: "Inspection" },
    { value: "leasing", label: "Leasing / showing unit" },
    { value: "vendor", label: "Vendors / contractors" },
    { value: "rent_collection", label: "Rent collection" },
    { value: "other", label: "Other rental work" },
    { value: "investor_review", label: "Reviewing statements", warn: true },
    { value: "commute", label: "Commute", warn: true },
    { value: "on_call", label: "On-call / waiting", warn: true },
  ],
  other_work: [
    { value: "w2", label: "W-2 / paycheck job" },
    { value: "consulting", label: "Consulting" },
    { value: "side_gig", label: "Side gig" },
    { value: "other", label: "Other work" },
  ],
};

export const MP_TESTS: { code: MpTestCode; label: string; hint: string }[] = [
  {
    code: "substantially_all",
    label: "Substantially all participation",
    hint: "You did substantially all of the work in this activity.",
  },
  {
    code: "100_and_most",
    label: "100+ hours and not less than anyone else",
    hint: "You participated 100+ hours and no one else participated more.",
  },
  {
    code: "spa",
    label: "Significant participation activities totaling 500+",
    hint: "This is a significant participation activity combined with others.",
  },
  {
    code: "five_of_ten",
    label: "Material participation in 5 of the last 10 years",
    hint: "You materially participated in this activity in 5 of the prior 10 years.",
  },
  {
    code: "personal_service",
    label: "Personal service activity (3 prior years)",
    hint: "Personal service activity with material participation in any 3 prior years.",
  },
  {
    code: "facts",
    label: "Facts and circumstances",
    hint: "Regular, continuous, and substantial participation (ask your CPA).",
  },
];

export function isNonCountingKind(kind: string | null): boolean {
  if (!kind) return false;
  return (NON_COUNTING_ACTIVITY_KINDS as readonly string[]).includes(kind);
}

export function activityLabel(category: Category, kind: string | null): string {
  if (!kind) return "";
  return ACTIVITY_KINDS[category].find((a) => a.value === kind)?.label ?? kind;
}
