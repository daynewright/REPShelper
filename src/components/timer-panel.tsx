"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Chip } from "@/components/chip";
import { FieldError } from "@/components/field-error";
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
import { ActivityKindSelect } from "@/components/activity-kind-select";
import { NonCountingWarning } from "@/components/non-counting-warning";
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
import { TimerPipPortal, useTimerPip } from "@/components/timer-pip";
import { ConfirmAction } from "@/components/confirm-action";
import {
  clearField,
  firstError,
  hasErrors,
  mapServerError,
  validateTimerStart,
  validateTimerStop,
  type FieldErrors,
} from "@/lib/form-validation";
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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [now, setNow] = useState(() => Date.now());
  const [pending, startTransition] = useTransition();
  const {
    supported: pipSupported,
    openPip,
    closePip,
    mountNode,
    pipWindow,
    isOpen,
  } = useTimerPip(Boolean(timer));

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (timer?.activity_kind) {
      setActivityKind(timer.activity_kind);
    }
  }, [timer?.activity_kind]);

  useEffect(() => {
    setErrors({});
  }, [timer]);

  const elapsed = timer
    ? (now - new Date(timer.started_at).getTime()) / 1000
    : 0;

  const kinds = useMemo(
    () => ACTIVITY_KINDS[timer?.category ?? category],
    [timer, category],
  );
  const warn = isNonCountingKind(activityKind);

  function clear(field: string) {
    setErrors((current) => clearField(current, field));
  }

  const stopAndSave = useCallback(() => {
    const nextErrors = validateTimerStop({ notes });
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      toast.error(firstError(nextErrors) ?? "Add a description first.");
      return;
    }
    setErrors({});
    const formData = new FormData();
    formData.set("notes", notes);
    formData.set("activity_kind", activityKind);
    startTransition(async () => {
      const result = await stopTimerAction(formData);
      if (result?.error) {
        setErrors(mapServerError(result.error));
        toast.error(result.error);
        return;
      }
      window.focus();
      closePip();
      toast.success("Timer saved");
    });
  }, [activityKind, closePip, notes]);

  const backToAppFromPip = useCallback(() => {
    // Native PiP click preserves the user gesture Chrome needs for focus().
    window.focus();
    closePip();
  }, [closePip]);

  if (timer) {
    return (
      <section className="rounded-xl bg-ink px-5 py-6 text-paper shadow-[0_12px_40px_-18px_color-mix(in_oklab,var(--ink)_70%,transparent)]">
        <TimerPipPortal
          timer={timer}
          elapsed={elapsed}
          activityKind={activityKind || timer.activity_kind}
          kinds={kinds}
          notes={notes}
          notesError={errors.notes}
          warn={warn}
          pending={pending}
          mountNode={mountNode}
          pipWindow={pipWindow}
          onActivityKindChange={setActivityKind}
          onNotesChange={(value) => {
            setNotes(value);
            clear("notes");
          }}
          onBackToApp={backToAppFromPip}
          onStopAndSave={stopAndSave}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium tracking-[0.18em] text-paper/60 uppercase">
            Timer running
          </p>
          <div className="flex items-center gap-2">
            {pipSupported ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-paper/30 bg-transparent text-paper hover:bg-paper/10 hover:text-paper"
                onClick={() => void openPip()}
              >
                {isOpen ? "Pop-out open" : "Pop out"}
              </Button>
            ) : null}
            <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-live uppercase">
              <span className="animate-live size-1.5 rounded-full bg-live" />
              Live
            </span>
          </div>
        </div>
        <p className="font-mono mt-4 text-5xl leading-none font-medium tracking-tight text-paper sm:text-6xl">
          {formatClock(elapsed)}
        </p>
        <p className="mt-3 text-sm text-paper/65">
          {CATEGORY_LABELS[timer.category]}
          {timer.performer === "spouse" ? " · Spouse" : ""}
        </p>
        <form
          noValidate
          className="mt-6 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            stopAndSave();
          }}
        >
          <input type="hidden" name="activity_kind" value={activityKind} />
          <ActivityKindSelect
            id="timer-activity-kind"
            value={activityKind}
            kinds={kinds}
            onChange={setActivityKind}
            tone="dark"
            labelClassName="text-paper/70"
          />
          {warn ? (
            <NonCountingWarning tone="dark" detail="short" />
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="timer-notes" className="text-paper/70">
              What did you do?
            </Label>
            <Textarea
              id="timer-notes"
              name="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                clear("notes");
              }}
              placeholder="Short description for the CPA log"
              aria-invalid={Boolean(errors.notes)}
            />
            <FieldError
              message={errors.notes}
              className="text-xs font-medium text-live"
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
            <ConfirmAction
              title="Discard this timer?"
              description="Elapsed time will not be saved to the log."
              confirmLabel="Discard"
              pending={pending}
              onConfirm={() => {
                startTransition(async () => {
                  await cancelTimerAction();
                  closePip();
                  toast.warning("Timer discarded");
                });
              }}
              trigger={
                <Button type="button" variant="destructive" disabled={pending}>
                  Discard
                </Button>
              }
            />
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
        noValidate
        className="mt-4 grid gap-3"
        action={(formData) => {
          const nextErrors = validateTimerStart({ category, propertyId });
          if (hasErrors(nextErrors)) {
            setErrors(nextErrors);
            toast.error(firstError(nextErrors) ?? "Check the form and try again.");
            return;
          }
          setErrors({});
          startTransition(async () => {
            const result = await startTimerAction(formData);
            if (result?.error) {
              setErrors(mapServerError(result.error));
              toast.error(result.error);
            }
          });
        }}
      >
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="property_id" value={propertyId} />
        <input type="hidden" name="performer" value={performer} />
        <input type="hidden" name="activity_kind" value={activityKind} />
        <div className="grid gap-1.5">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((value) => (
              <Chip
                key={value}
                selected={category === value}
                onClick={() => {
                  setCategory(value);
                  setActivityKind("");
                  if (value !== "rental") setPerformer("taxpayer");
                  clear("category");
                  clear("property_id");
                }}
              >
                {CATEGORY_LABELS[value]}
              </Chip>
            ))}
          </div>
          <FieldError message={errors.category} />
        </div>
        <ActivityKindSelect
          id="start-activity-kind"
          value={activityKind}
          kinds={kinds}
          onChange={setActivityKind}
        />
        {warn ? <NonCountingWarning detail="short" /> : null}
        {category === "rental" && (
          <>
            {activeProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add a rental before timing rental work.
              </p>
            ) : (
              <div className="grid gap-1.5">
                <Select
                  value={propertyId}
                  onValueChange={(value) => {
                    setPropertyId(value);
                    clear("property_id");
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={Boolean(errors.property_id)}
                  >
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
                <FieldError message={errors.property_id} />
              </div>
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
        {errors._form ? <FieldError message={errors._form} /> : null}
        <div className="grid gap-2 pt-1">
          <Button type="submit" className="h-11 w-full" disabled={pending}>
            Start timer
          </Button>
          <Link
            href="/log"
            className="text-muted-foreground hover:text-ink py-1 text-center text-sm underline-offset-4 hover:underline"
          >
            Or log hours without a timer
          </Link>
        </div>
      </form>
    </section>
  );
}
