import { TriangleAlertIcon } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { InfoSheet } from "@/components/info-sheet";
import { cn } from "@/lib/utils";

export function NonCountingWarning({
  className,
  tone = "light",
  detail = "full",
}: {
  className?: string;
  /** Dark timer panel needs inverted colors. */
  tone?: "light" | "dark";
  detail?: "full" | "short";
}) {
  return (
    <Alert
      variant="warning"
      className={cn(
        tone === "dark" &&
          "border-live/50 bg-live/15 text-paper *:data-[slot=alert-description]:text-paper/85 *:[svg]:text-live",
        className,
      )}
    >
      <TriangleAlertIcon />
      <AlertTitle>May not count toward REPS</AlertTitle>
      <AlertDescription>
        {detail === "short"
          ? "Confirm with your CPA before relying on these hours."
          : "Investor-type work, commute, and on-call time often do not count. Confirm with your CPA before relying on these hours."}
      </AlertDescription>
      <AlertAction>
        <InfoSheet topic="non_counting" tone={tone} label="Why?" />
      </AlertAction>
    </Alert>
  );
}
