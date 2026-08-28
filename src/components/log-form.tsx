"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Chip } from "@/components/chip";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ACTIVITY_KINDS,
  CATEGORY_LABELS,
  isNonCountingKind,
} from "@/lib/reps/constants";
import { todayISO } from "@/lib/date";
import { createEntryAction } from "@/lib/actions/entries";
import type { Category, Performer, Property, TimeEntry } from "@/lib/types";

const CATEGORY_OPTIONS: Category[] = [
  "real_property_trade",
  "rental",
  "other_work",
];

export function LogForm({
  properties,
  lastEntry,
}: {
  properties: Property[];
  lastEntry: TimeEntry | null;
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
  const [pending, start] = useTransition();
  const warn = isNonCountingKind(activityKind);

  const kinds = useMemo(() => ACTIVITY_KINDS[category], [category]);

  function fillRepeat() {
    if (!lastEntry) return;
    setCategory(lastEntry.category);
    setPropertyId(lastEntry.property_id ?? activeProperties[0]?.id ?? "");
    setPerformer(lastEntry.performer);
    setActivityKind(lastEntry.activity_kind ?? "");
  }

  return (
    <form
      className="bg-card grid gap-5 rounded-xl p-5 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80"
      action={(formData) => {
        start(async () => {
          const result = await createEntryAction(formData);
          if (result?.error) toast.error(result.error);
          else toast.success("Hours saved");
        });
      }}
    >
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="performer" value={performer} />
      <input type="hidden" name="activity_kind" value={activityKind} />

      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((value) => (
          <Chip
            key={value}
            selected={category === value}
            onClick={() => {
              setCategory(value);
              setActivityKind("");
              if (value !== "rental") setPerformer("taxpayer");
            }}
          >
            {CATEGORY_LABELS[value]}
          </Chip>
        ))}
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
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger id="property" className="w-full">
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
        <Input
          id="occurred_on"
          name="occurred_on"
          type="date"
          defaultValue={todayISO()}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="hours">Hours</Label>
          <Input
            id="hours"
            name="hours"
            type="number"
            min="0.25"
            step="0.25"
            placeholder="1.5"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Label htmlFor="start_time">Start</Label>
            <Input id="start_time" name="start_time" type="time" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end_time">End</Label>
            <Input id="end_time" name="end_time" type="time" />
          </div>
        </div>
      </div>
      <p className="text-muted-foreground -mt-2 text-xs">
        Enter hours, or start and end times (start/end is stronger for the CPA
        file).
      </p>

      <div className="grid gap-2">
        <Label>Activity</Label>
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((kind) => (
            <Chip
              key={kind.value}
              size="sm"
              selected={activityKind === kind.value}
              onClick={() => setActivityKind(kind.value)}
            >
              {kind.label}
            </Chip>
          ))}
        </div>
      </div>

      {warn && (
        <Alert>
          <AlertDescription>
            Investor-type work, commute, and on-call time often do not count.
            Confirm with your CPA before relying on these hours.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="notes">What did you do?</Label>
        <Textarea
          id="notes"
          name="notes"
          required
          placeholder="e.g. Met plumber at 12 Oak, replaced garbage disposal"
        />
      </div>

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
