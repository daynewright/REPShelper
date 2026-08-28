import { cn } from "@/lib/utils";
import { InfoSheet } from "@/components/info-sheet";
import { Progress } from "@/components/ui/progress";
import { MP_HOUR_THRESHOLD } from "@/lib/reps/constants";
import { formatHours, type YearSummary } from "@/lib/reps/summary";

function ListingStatus({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase",
        met ? "bg-sold/12 text-sold" : "bg-ink/8 text-ink/65",
      )}
    >
      {label}
    </span>
  );
}

function hoursBar(hours: number, max: number) {
  return Math.min(100, Math.round((hours / max) * 100));
}

export function StatusCards({ summary }: { summary: YearSummary }) {
  const mpMet = summary.materialParticipation.every((a) => a.met500);
  const mpPartial =
    summary.materialParticipation.length > 0 &&
    summary.materialParticipation.some((a) => a.met500) &&
    !mpMet;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <article
        className={cn(
          "bg-card flex flex-col gap-3 rounded-xl p-4 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80",
          summary.reps750.met ? "border-l-[3px] border-sold" : "border-l-[3px] border-ink",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
              750-hour test
            </p>
            <InfoSheet topic="reps_750" />
          </div>
          <ListingStatus
            met={summary.reps750.met}
            label={summary.reps750.met ? "Met" : "Not met"}
          />
        </div>
        <p className="font-mono text-4xl leading-none font-medium tracking-tight">
          {summary.reps750.hours.toFixed(1)}
        </p>
        <p className="text-muted-foreground text-xs">of 750 hours</p>
        <Progress
          value={hoursBar(summary.reps750.hours, 750)}
          indicatorClassName={summary.reps750.met ? "bg-sold" : undefined}
        />
        <p className="text-sm leading-relaxed">
          Taxpayer hours in real property trades and rentals.
          {!summary.reps750.met && (
            <span className="text-muted-foreground">
              {" "}
              {summary.reps750.remainingHours.toFixed(1)} still needed.
            </span>
          )}
        </p>
        {summary.weeklyPaceHours !== null &&
          summary.weeklyPaceHours > 0 &&
          !summary.reps750.met && (
            <p className="text-muted-foreground text-xs">
              About {summary.weeklyPaceHours} hours/week to finish 750 this
              year.
            </p>
          )}
      </article>

      <article
        className={cn(
          "bg-card flex flex-col gap-3 rounded-xl p-4 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80",
          summary.reps50.met ? "border-l-[3px] border-sold" : "border-l-[3px] border-ink",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
              More than 50%
            </p>
            <InfoSheet topic="reps_50" />
          </div>
          <ListingStatus
            met={summary.reps50.met}
            label={summary.reps50.met ? "Met" : "Not met"}
          />
        </div>
        <p className="font-mono text-4xl leading-none font-medium tracking-tight">
          {summary.reps50.percent === null ? "—" : `${summary.reps50.percent}%`}
        </p>
        <p className="text-muted-foreground text-xs">of logged personal services</p>
        <Progress
          value={summary.reps50.percent ?? 0}
          indicatorClassName={summary.reps50.met ? "bg-sold" : undefined}
        />
        <p className="text-sm leading-relaxed">
          {summary.reps50.percent === null
            ? "No hours logged yet."
            : `${formatHours(summary.reps50.numeratorMinutes)} / ${formatHours(summary.reps50.denominatorMinutes)} hours are real estate.`}
        </p>
        {summary.reps50.otherWorkUnlogged && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            No other work logged. If real estate is your only occupation, this
            test is likely met — log any non-real-estate work or the test is
            incomplete.
          </p>
        )}
      </article>

      <article
        className={cn(
          "bg-card flex flex-col gap-3 rounded-xl p-4 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80 sm:col-span-1",
          mpMet && summary.materialParticipation.length > 0
            ? "border-l-[3px] border-sold"
            : "border-l-[3px] border-ink",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
              Rental participation
            </p>
            <InfoSheet topic="material_participation" />
          </div>
          <ListingStatus
            met={mpMet && summary.materialParticipation.length > 0}
            label={
              summary.materialParticipation.length === 0
                ? "No rentals"
                : mpMet
                  ? "500+ hrs"
                  : mpPartial
                    ? "Partial"
                    : "Under 500"
            }
          />
        </div>
        {summary.materialParticipation.length === 0 ? (
          <>
            <p className="font-mono text-4xl leading-none font-medium tracking-tight">
              —
            </p>
            <p className="text-muted-foreground text-xs">Add a rental to track</p>
          </>
        ) : (
          <>
            <p className="font-mono text-4xl leading-none font-medium tracking-tight">
              {formatHours(
                Math.max(
                  ...summary.materialParticipation.map((a) => a.totalMinutes),
                ),
              )}
            </p>
            <p className="text-muted-foreground text-xs">
              {summary.grouped
                ? "grouped hours / 500"
                : "highest property / 500"}
            </p>
          </>
        )}
        <div className="space-y-3">
          {summary.materialParticipation.length === 0 ? (
            <p className="text-sm">Add a rental to track material participation.</p>
          ) : (
            summary.materialParticipation.map((activity) => (
              <div key={activity.propertyId ?? "grouped"} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{activity.name}</span>
                  <span className="font-mono text-xs">
                    {formatHours(activity.totalMinutes)} / {MP_HOUR_THRESHOLD}
                  </span>
                </div>
                <Progress
                  value={hoursBar(activity.totalMinutes / 60, MP_HOUR_THRESHOLD)}
                  indicatorClassName={activity.met500 ? "bg-sold" : undefined}
                />
                <p className="text-muted-foreground text-xs">
                  You {formatHours(activity.taxpayerMinutes)} · spouse{" "}
                  {formatHours(activity.spouseMinutes)}
                  {activity.otherTests.length > 0
                    ? ` · also claiming: ${activity.otherTests.map((t) => t.label).join("; ")}`
                    : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
