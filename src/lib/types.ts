export type EmploymentType = "independent" | "owner_5pct" | "w2_employee";
export type Category = "real_property_trade" | "rental" | "other_work";
export type Performer = "taxpayer" | "spouse";
export type EntrySource = "timer" | "manual";

export type Profile = {
  id: string;
  legal_name: string;
  spouse_name: string | null;
  real_estate_employment: EmploymentType | null;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  archived_at: string | null;
  created_at: string;
};

export type TimeEntry = {
  id: string;
  user_id: string;
  occurred_on: string;
  duration_minutes: number;
  started_at: string | null;
  ended_at: string | null;
  category: Category;
  property_id: string | null;
  performer: Performer;
  activity_kind: string | null;
  notes: string;
  source: EntrySource;
  created_at: string;
};

export type ActiveTimer = {
  user_id: string;
  started_at: string;
  category: Category;
  property_id: string | null;
  performer: Performer;
  activity_kind: string | null;
  notes: string | null;
};

export type TaxYearSettings = {
  id: string;
  user_id: string;
  year: number;
  group_rental_activities: boolean;
};

export type MpTestCode =
  | "substantially_all"
  | "100_and_most"
  | "spa"
  | "five_of_ten"
  | "personal_service"
  | "facts";

export type ParticipationFlag = {
  id: string;
  user_id: string;
  year: number;
  property_id: string | null;
  test_code: MpTestCode;
  claimed: boolean;
  note: string | null;
};
