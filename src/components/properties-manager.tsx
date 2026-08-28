"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MP_TESTS } from "@/lib/reps/constants";
import { formatHours, type MpActivitySummary } from "@/lib/reps/summary";
import {
  archivePropertyAction,
  createPropertyAction,
  updatePropertyAction,
} from "@/lib/actions/properties";
import { saveMpFlagAction, setGroupingAction } from "@/lib/actions/settings";
import type { ParticipationFlag, Property } from "@/lib/types";

export function PropertiesManager({
  year,
  properties,
  grouped,
  flags,
  mp,
}: {
  year: number;
  properties: Property[];
  grouped: boolean;
  flags: ParticipationFlag[];
  mp: MpActivitySummary[];
}) {
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-8">
      <form
        className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-rule/80 sm:flex-row sm:items-start sm:justify-between"
        action={(formData) => start(() => setGroupingAction(formData))}
      >
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="grouped" value={grouped ? "" : "on"} />
        <div className="text-sm">
          <p className="font-medium">
            Track rentals as one activity (grouping election)
          </p>
          <p className="text-muted-foreground mt-1">
            Currently {grouped ? "grouped" : "per property"}. This only changes
            how hours are totaled here. Your CPA must still make or confirm the
            Treas. Reg. §1.469-9(g) election on the return. It is generally
            irrevocable without IRS consent.
          </p>
        </div>
        <Button type="submit" variant="outline" disabled={pending}>
          {grouped ? "Track separately" : "Track as grouped"}
        </Button>
      </form>

      <section className="grid gap-3">
        <h2 className="font-display text-lg font-semibold">Add a rental</h2>
        <form
          className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-rule/80 sm:grid-cols-[1fr_1fr_auto]"
          action={(formData) => {
            start(async () => {
              const result = await createPropertyAction(formData);
              if (result?.error) toast.error(result.error);
              else toast.success("Rental added");
            });
          }}
        >
          <Input name="name" placeholder="12 Oak St" required />
          <Input name="address" placeholder="Address (optional)" />
          <Button type="submit" disabled={pending}>
            Add
          </Button>
        </form>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-lg font-semibold">Your rentals</h2>
        {properties.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No properties yet. Add one to log rental hours.
          </p>
        ) : (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              year={year}
              grouped={grouped}
              flags={flags}
              mp={mp.find((a) => a.propertyId === property.id)}
            />
          ))
        )}
      </section>

      {grouped && (
        <MpTests
          year={year}
          propertyId=""
          flags={flags.filter((f) => f.property_id === null)}
          title="Grouped activity — other participation tests"
        />
      )}
    </div>
  );
}

function PropertyCard({
  property,
  year,
  grouped,
  flags,
  mp,
}: {
  property: Property;
  year: number;
  grouped: boolean;
  flags: ParticipationFlag[];
  mp?: MpActivitySummary;
}) {
  const [pending, start] = useTransition();
  const archived = Boolean(property.archived_at);

  return (
    <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-rule/80">
      <form
        className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        action={(formData) => {
          start(async () => {
            const result = await updatePropertyAction(formData);
            if (result?.error) toast.error(result.error);
            else toast.success("Saved");
          });
        }}
      >
        <input type="hidden" name="id" value={property.id} />
        <Input name="name" defaultValue={property.name} required />
        <Input name="address" defaultValue={property.address ?? ""} />
        <Button type="submit" variant="outline" disabled={pending}>
          Save
        </Button>
      </form>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {mp
            ? `${formatHours(mp.totalMinutes)} hours this year (you ${formatHours(mp.taxpayerMinutes)}, spouse ${formatHours(mp.spouseMinutes)})`
            : "No hours this year"}
          {archived ? " · Archived" : ""}
        </p>
        <form
          action={(formData) => {
            start(async () => {
              await archivePropertyAction(formData);
            });
          }}
        >
          <input type="hidden" name="id" value={property.id} />
          <input type="hidden" name="archived" value={archived ? "0" : "1"} />
          <Button type="submit" size="sm" variant="outline">
            {archived ? "Restore" : "Archive"}
          </Button>
        </form>
      </div>
      {!grouped && !archived && (
        <MpTests
          year={year}
          propertyId={property.id}
          flags={flags.filter((f) => f.property_id === property.id)}
          title="Other material participation tests"
        />
      )}
    </div>
  );
}

function MpTests({
  year,
  propertyId,
  flags,
  title,
}: {
  year: number;
  propertyId: string;
  flags: ParticipationFlag[];
  title: string;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground text-xs">
        The 500-hour test is calculated from your log. Check others only if they
        apply — your CPA should confirm.
      </p>
      {MP_TESTS.map((test) => {
        const existing = flags.find((f) => f.test_code === test.code);
        return (
          <MpTestRow
            key={test.code}
            year={year}
            propertyId={propertyId}
            test={test}
            existing={existing}
          />
        );
      })}
    </div>
  );
}

function MpTestRow({
  year,
  propertyId,
  test,
  existing,
}: {
  year: number;
  propertyId: string;
  test: (typeof MP_TESTS)[number];
  existing?: ParticipationFlag;
}) {
  const [pending, start] = useTransition();
  const [claimed, setClaimed] = useState(Boolean(existing));

  return (
    <form
      className="grid gap-2 rounded-lg bg-fog/70 p-3"
      action={(formData) => {
        start(async () => {
          await saveMpFlagAction(formData);
        });
      }}
    >
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="test_code" value={test.code} />
      <input type="hidden" name="claimed" value={claimed ? "on" : ""} />
      <label className="flex items-start gap-2 text-sm">
        <Checkbox
          checked={claimed}
          onCheckedChange={(value) => setClaimed(value === true)}
        />
        <span>
          <span className="font-medium">{test.label}</span>
          <span className="text-muted-foreground mt-0.5 block text-xs">
            {test.hint}
          </span>
        </span>
      </label>
      <Textarea
        name="note"
        defaultValue={existing?.note ?? ""}
        placeholder="Note for the CPA (optional)"
        className="min-h-16"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Save test
      </Button>
    </form>
  );
}
