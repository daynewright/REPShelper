"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Chip } from "@/components/chip";
import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityKindSelect } from "@/components/activity-kind-select";
import { DatePicker } from "@/components/date-picker";
import { InfoSheet } from "@/components/info-sheet";
import { NonCountingWarning } from "@/components/non-counting-warning";
import { TimePicker } from "@/components/time-picker";
import {
  ACTIVITY_KINDS,
  CATEGORY_LABELS,
  isNonCountingKind,
} from "@/lib/reps/constants";
import { todayISO } from "@/lib/date";
import { createEntryAction } from "@/lib/actions/entries";
import {
  clearField,
  firstError,
  hasErrors,
  mapServerError,
  validateLogEntry,
  type FieldErrors,
} from "@/lib/form-validation";
import { cn } from "@/lib/utils";
import type { Category, Performer, Property, TimeEntry } from "@/lib/types";

const CATEGORY_OPTIONS: Category[] = [
  "real_property_trade",
  "rental",
  "other_work",
];

const FIELD_FOCUS: Record<string, string> = {
  category: "occurred_on",
  property_id: "property",
  occurred_on: "occurred_on",
  hours: "hours",
  start_time: "start_time",
  end_time: "end_time",
  notes: "notes",
};

export function LogForm({
  properties,
  lastEntry,
  className,
}: {
  properties: Property[];
  lastEntry: TimeEntry | null;
  className?: string;
}) {
  const activeProperties = properties.filter((p) => !p.archived_at);
  const [category, setCategory] = useState<Category>(
    lastEntry?.category ?? "real_property_trade",
  );
  const [propertyId, setPropertyId] = useState(
    lastEntry?.property_id ?? activeProperties[0]?.id ?? "",
  );
  const [performer, setPerformer] = useState<Performer>(
    lastEntry?.performer ?? "taxpayer",
  );
  const [activityKind, setActivityKind] = useState(
    lastEntry?.activity_kind ?? "",
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();
  const warn = isNonCountingKind(activityKind);

  const kinds = useMemo(() => ACTIVITY_KINDS[category], [category]);

  function fillRepeat() {
    if (!lastEntry) return;
    setCategory(lastEntry.category);
    setPropertyId(lastEntry.property_id ?? activeProperties[0]?.id ?? "");
    setPerformer(lastEntry.performer);
    setActivityKind(lastEntry.activity_kind ?? "");
    setErrors({});
  }

  function clear(field: string) {
    setErrors((current) => clearField(current, field));
  }

  function focusFirst(nextErrors: FieldErrors) {
    const key = Object.keys(nextErrors)[0];
    if (!key) return;
    const id = FIELD_FOCUS[key];
    if (!id) return;
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.focus();
    });
  }

  return (
    <form
      noValidate
      className={cn(
        "bg-card grid gap-5 rounded-xl p-5 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const nextErrors = validateLogEntry({
          category,
          propertyId,
          occurredOn: String(formData.get("occurred_on") ?? ""),
          hours: String(formData.get("hours") ?? ""),
          startTime: String(formData.get("start_time") ?? ""),
          endTime: String(formData.get("end_time") ?? ""),
          notes: String(formData.get("notes") ?? ""),
        });
        if (hasErrors(nextErrors)) {
          setErrors(nextErrors);
          toast.error(firstError(nextErrors) ?? "Check the form and try again.");
          focusFirst(nextErrors);
          return;
        }

        setErrors({});
        // Prefer complete start/end when both are present; otherwise strip
        // stray single times so hours can save cleanly.
        const startTime = String(formData.get("start_time") ?? "").trim();
        const endTime = String(formData.get("end_time") ?? "").trim();
        if (!(startTime && endTime)) {
          formData.delete("start_time");
          formData.delete("end_time");
        }

        startTransition(async () => {
          const result = await createEntryAction(formData);
          if (result?.error) {
            const mapped = mapServerError(result.error);
            setErrors(mapped);
            toast.error(result.error);
            focusFirst(mapped);
            return;
          }
          toast.success("Hours saved");
          form.reset();
          setActivityKind("");
          setCategory(lastEntry?.category ?? "real_property_trade");
          setPropertyId(
            lastEntry?.property_id ?? activeProperties[0]?.id ?? "",
          );
          setPerformer(lastEntry?.performer ?? "taxpayer");
        });
      }}
    >
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="performer" value={performer} />
      <input type="hidden" name="activity_kind" value={activityKind} />

      <div className="grid gap-1.5">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((value) => (
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

      {category === "rental" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="property">Property</Label>
            {activeProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add a rental on the Rentals page first.
              </p>
            ) : (
              <Select
                value={propertyId}
                onValueChange={(value) => {
                  setPropertyId(value);
                  clear("property_id");
                }}
              >
                <SelectTrigger
                  id="property"
                  className="w-full"
                  aria-invalid={Boolean(errors.property_id)}
                >
                  <SelectValue placeholder="Choose a property" />
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
            <FieldError message={errors.property_id} />
          </div>
          <div className="flex gap-2">
            <Chip
              selected={performer === "taxpayer"}
              onClick={() => setPerformer("taxpayer")}
            >
              I did this
            </Chip>
            <Chip
              selected={performer === "spouse"}
              onClick={() => setPerformer("spouse")}
            >
              Spouse did this
            </Chip>
          </div>
        </>
      )}

      <div className="grid gap-2">
        <Label htmlFor="occurred_on">Date</Label>
        <DatePicker
          id="occurred_on"
          name="occurred_on"
          defaultValue={todayISO()}
          aria-invalid={Boolean(errors.occurred_on)}
          onChange={() => clear("occurred_on")}
        />
        <FieldError message={errors.occurred_on} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,8rem)_1fr]">
        <div className="grid gap-2">
          <Label htmlFor="hours">Hours</Label>
          <Input
            id="hours"
            name="hours"
            type="number"
            min="0.25"
            step="0.25"
            placeholder="1.5"
            aria-invalid={Boolean(errors.hours)}
            onChange={() => {
              clear("hours");
              clear("start_time");
              clear("end_time");
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Label htmlFor="start_time">Start</Label>
            <TimePicker
              id="start_time"
              name="start_time"
              aria-invalid={Boolean(errors.start_time)}
              onChange={() => {
                clear("start_time");
                clear("hours");
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end_time">End</Label>
            <TimePicker
              id="end_time"
              name="end_time"
              aria-invalid={Boolean(errors.end_time)}
              onChange={() => {
                clear("end_time");
                clear("hours");
              }}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-1 -mt-2">
        <FieldError message={errors.hours ?? errors.start_time ?? errors.end_time} />
        <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
          <p>
            Enter hours, or start and end times (start/end is stronger for the
            CPA file).
          </p>
          <InfoSheet topic="contemporaneous_log" label="Why?" />
        </div>
      </div>

      <ActivityKindSelect
        value={activityKind}
        kinds={kinds}
        onChange={setActivityKind}
      />

      {warn ? <NonCountingWarning /> : null}

      <div className="grid gap-2">
        <Label htmlFor="notes">What did you do?</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="e.g. Met plumber at 12 Oak, replaced garbage disposal"
          aria-invalid={Boolean(errors.notes)}
          onChange={() => clear("notes")}
        />
        <FieldError message={errors.notes} />
      </div>

      {errors._form ? <FieldError message={errors._form} /> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save hours"}
        </Button>
        {lastEntry && (
          <Button type="button" variant="outline" onClick={fillRepeat}>
            Same as last
          </Button>
        )}
      </div>
    </form>
  );
}
