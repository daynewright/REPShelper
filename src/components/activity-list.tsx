"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/confirm-action";
import { FieldError } from "@/components/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LABELS,
  activityLabel,
} from "@/lib/reps/constants";
import { formatHours } from "@/lib/reps/summary";
import { parseISODate } from "@/lib/date";
import { deleteEntryAction, updateEntryAction } from "@/lib/actions/entries";
import {
  clearField,
  firstError,
  hasErrors,
  mapServerError,
  validateEntryEdit,
  type FieldErrors,
} from "@/lib/form-validation";
import type { Property, TimeEntry } from "@/lib/types";

export function ActivityList({
  entries,
  properties,
}: {
  entries: TimeEntry[];
  properties: Property[];
}) {
  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-xl px-5 py-10 text-center ring-1 ring-rule/80">
        <p className="font-display text-lg font-semibold">No hours yet</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Start a timer or log a block so this tax year has a contemporaneous
          record.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2">
      {entries.map((entry) => (
        <ActivityRow
          key={entry.id}
          entry={entry}
          properties={properties}
        />
      ))}
    </ul>
  );
}

function ActivityRow({
  entry,
  properties,
}: {
  entry: TimeEntry;
  properties: Property[];
}) {
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const property = properties.find((p) => p.id === entry.property_id);
  const late = entry.created_at.slice(0, 10) > entry.occurred_on;
  const occurred = parseISODate(entry.occurred_on);
  const day = occurred.getDate();
  const month = occurred.toLocaleDateString("en-US", { month: "short" });

  function clear(field: string) {
    setErrors((current) => clearField(current, field));
  }

  if (editing) {
    return (
      <li className="bg-card rounded-xl p-4 ring-1 ring-rule/80">
        <form
          noValidate
          className="grid gap-2"
          action={(formData) => {
            const nextErrors = validateEntryEdit({
              occurredOn: String(formData.get("occurred_on") ?? ""),
              hours: String(formData.get("hours") ?? ""),
              notes: String(formData.get("notes") ?? ""),
            });
            if (hasErrors(nextErrors)) {
              setErrors(nextErrors);
              toast.error(firstError(nextErrors) ?? "Check the form and try again.");
              return;
            }
            setErrors({});
            start(async () => {
              const result = await updateEntryAction(formData);
              if (result?.error) {
                setErrors(mapServerError(result.error));
                toast.error(result.error);
              } else {
                toast.success("Updated");
                setEditing(false);
              }
            });
          }}
        >
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="category" value={entry.category} />
          <input
            type="hidden"
            name="property_id"
            value={entry.property_id ?? ""}
          />
          <input type="hidden" name="performer" value={entry.performer} />
          <input
            type="hidden"
            name="activity_kind"
            value={entry.activity_kind ?? ""}
          />
          <div className="grid gap-1.5">
            <Input
              name="occurred_on"
              type="date"
              defaultValue={entry.occurred_on}
              aria-invalid={Boolean(errors.occurred_on)}
              onChange={() => clear("occurred_on")}
            />
            <FieldError message={errors.occurred_on} />
          </div>
          <div className="grid gap-1.5">
            <Input
              name="hours"
              type="number"
              min="0.25"
              step="0.25"
              defaultValue={entry.duration_minutes / 60}
              aria-invalid={Boolean(errors.hours)}
              onChange={() => clear("hours")}
            />
            <FieldError message={errors.hours} />
          </div>
          <div className="grid gap-1.5">
            <Textarea
              name="notes"
              defaultValue={entry.notes}
              aria-invalid={Boolean(errors.notes)}
              onChange={() => clear("notes")}
            />
            <FieldError message={errors.notes} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="bg-card grid grid-cols-[3.25rem_1fr] gap-3 rounded-xl p-3 ring-1 ring-rule/80 sm:grid-cols-[4rem_1fr_auto] sm:items-start">
      <div className="text-center">
        <p className="font-mono text-2xl leading-none font-medium">{day}</p>
        <p className="text-muted-foreground mt-1 text-[10px] font-medium tracking-[0.14em] uppercase">
          {month}
        </p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="font-mono text-lg font-medium tracking-tight">
            {formatHours(entry.duration_minutes)}
            <span className="text-muted-foreground ml-1 text-xs font-sans font-normal">
              hrs
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {CATEGORY_LABELS[entry.category]}
            {entry.performer === "spouse" ? " · Spouse" : ""}
            {property ? ` · ${property.name}` : ""}
            {entry.activity_kind
              ? ` · ${activityLabel(entry.category, entry.activity_kind)}`
              : ""}
          </p>
        </div>
        <p className="mt-1 text-sm leading-relaxed">{entry.notes}</p>
        {late && (
          <p className="text-muted-foreground mt-1 text-xs">Logged later</p>
        )}
      </div>
      <div className="col-span-2 flex gap-1 sm:col-span-1 sm:justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
        <ConfirmAction
          title="Delete this entry?"
          description="This hour block will be removed from the log and cannot be undone."
          confirmLabel="Delete"
          pending={pending}
          onConfirm={() => {
            start(async () => {
              const formData = new FormData();
              formData.set("id", entry.id);
              const result = await deleteEntryAction(formData);
              if (result?.error) toast.error(result.error);
              else toast.success("Deleted");
            });
          }}
          trigger={
            <Button type="button" size="sm" variant="destructive" disabled={pending}>
              Delete
            </Button>
          }
        />
      </div>
    </li>
  );
}
