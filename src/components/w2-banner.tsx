import Link from "next/link";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { InfoSheet } from "@/components/info-sheet";
import { EMPLOYMENT_LABELS } from "@/lib/reps/constants";

export function W2Banner({
  employment,
}: {
  employment: "independent" | "owner_5pct" | "w2_employee" | null;
}) {
  if (employment !== "w2_employee") return null;
  return (
    <Alert className="border-live/40 bg-live/10">
      <AlertTitle>W-2 agent hours are not counted toward REPS</AlertTitle>
      <AlertDescription>
        You selected {EMPLOYMENT_LABELS.w2_employee}. Under IRC §469(c)(7)(D)(ii),
        employee hours generally do not count toward the 750-hour or 50% tests
        unless you own 5% of the brokerage. Those hours still appear in your log
        and in the 50% denominator. Change this in{" "}
        <Link href="/settings">Settings</Link> only after talking with your CPA.
      </AlertDescription>
      <AlertAction>
        <InfoSheet topic="w2_employee" label="Why?" />
      </AlertAction>
    </Alert>
  );
}
