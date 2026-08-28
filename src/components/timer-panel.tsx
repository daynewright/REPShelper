"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Chip } from "@/components/chip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ACTIVITY_KINDS,
  CATEGORY_LABELS,
  isNonCountingKind,
} from "@/lib/reps/constants";
import { formatClock } from "@/lib/date";
import {
  cancelTimerAction,
  startTimerAction,
  stopTimerAction,
} from "@/lib/actions/entries";
import type { ActiveTimer, Category, Performer, Property } from "@/lib/types";

export function TimerPanel({
  timer,
  properties,
}: {
  timer: ActiveTimer | null;
  properties: Property[];
}) {
  const activeProperties = properties.filter((p) => !p.archived_at);
  const [category, setCategory] = useState<Category>("real_property_trade");
  const [propertyId, setPropertyId] = useState(activeProperties[0]?.id ?? "");
  const [performer, setPerformer] = useState<Performer>("taxpayer");
  const [notes, setNotes] = useState("");
  const [activityKind, setActivityKind] = useState(timer?.activity_kind ?? "");
  const [now, setNow] = useState(() => Date.now());
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const elapsed = timer
    ? (now - new Date(timer.started_at).getTime()) / 1000
    : 0;

  const kinds = useMemo(
    () => ACTIVITY_KINDS[timer?.category ?? category],
    [timer, category],
  );
  const warn = isNonCountingKind(activityKind);

  if (timer) {
    return (
      <section className="rounded-xl bg-ink px-5 py-6 text-paper shadow-[0_12px_40px_-18px_color-mix(in_oklab,var(--ink)_70%,transparent)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium tracking-[0.18em] text-paper/60 uppercase">
            Timer running
          </p>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-live uppercase">
            <span className="animate-live size-1.5 rounded-full bg-live" />
            Live
          </span>
        </div>
        <p className="font-mono mt-4 text-5xl leading-none font-medium tracking-tight text-paper sm:text-6xl">
          {formatClock(elapsed)}
        </p>
        <p className="mt-3 text-sm text-paper/65">
          {CATEGORY_LABELS[timer.category]}
          {timer.performer === "spouse" ? " · Spouse" : ""}
        </p>
        <form
          className="mt-6 grid gap-3"
          action={(formData) => {
            start(async () => {
              const result = await stopTimerAction(formData);
              if (result?.error) toast.error(result.error);
              else toast.success("Timer saved");
            });
          }}
        >
          <input type="hidden" name="activity_kind" value={activityKind} />
          <div className="flex flex-wrap gap-1.5">
            {kinds.map((kind) => (
              <Chip
                key={kind.value}
                size="sm"
                selected={activityKind === kind.value}
                onClick={() => setActivityKind(kind.value)}
                className={
                  activityKind === kind.value
                    ? "bg-paper text-ink"
                    : "bg-transparent text-paper/80 ring-paper/25 hover:bg-paper/10"
                }
              >
                {kind.label}
              </Chip>
            ))}
          </div>
          {warn && (
            <Alert className="border-live/40 bg-paper/8 text-paper">
              <AlertDescription className="text-paper/80">
                This activity type often does not count. Confirm with your CPA.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="timer-notes" className="text-paper/70">
              What did you do?
            </Label>
            <Textarea
              id="timer-notes"
              name="notes"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Short description for the CPA log"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={pending}
              className="bg-live text-ink hover:bg-live/90"
            >
              Stop and save
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              className="border-paper/30 bg-transparent text-paper hover:bg-paper/10 hover:text-paper"
              onClick={() =>
                start(async () => {
                  await cancelTimerAction();
                  toast.message("Timer discarded");
                })
              }
            >
              Discard
            </Button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-xl p-5 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80">
      <p className="text-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase">
        Live timer
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
        Start the clock
      </h2>
      <form
        className="mt-4 grid gap-3"
        action={(formData) => {
          start(async () => {
            const result = await startTimerAction(formData);
            if (result?.error) toast.error(result.error);
          });
        }}
      >
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="property_id" value={propertyId} />
        <input type="hidden" name="performer" value={performer} />
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((value) => (
            <Chip
              key={value}
              selected={category === value}
              onClick={() => {
                setCategory(value);
                if (value !== "rental") setPerformer("taxpayer");
              }}
            >
              {CATEGORY_LABELS[value]}
            </Chip>
          ))}
        </div>
        {category === "rental" && (
          <>
            {activeProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add a rental before timing rental work.
              </p>
            ) : (
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  {activeProperties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex gap-2">
              <Chip
                selected={performer === "taxpayer"}
                onClick={() => setPerformer("taxpayer")}
              >
                Me
              </Chip>
              <Chip
                selected={performer === "spouse"}
                onClick={() => setPerformer("spouse")}
              >
                Spouse
              </Chip>
            </div>
          </>
        )}
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={pending || (category === "rental" && !propertyId)}
        >
          Start
        </Button>
      </form>
    </section>
  );
}
