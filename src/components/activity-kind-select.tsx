"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ActivityKindSelect({
  id = "activity-kind",
  label = "Activity type",
  value,
  kinds,
  onChange,
  tone = "light",
  labelClassName,
}: {
  id?: string;
  label?: string;
  value: string;
  kinds: { value: string; label: string }[];
  onChange: (value: string) => void;
  tone?: "light" | "dark";
  labelClassName?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "w-full",
            tone === "dark" &&
              "border-paper/30 bg-transparent text-paper hover:bg-paper/10 focus-visible:border-live focus-visible:ring-live/30 data-placeholder:text-paper/50 [&_svg]:text-paper/60",
          )}
        >
          <SelectValue placeholder="Optional" />
        </SelectTrigger>
        <SelectContent>
          {kinds.map((kind) => (
            <SelectItem key={kind.value} value={kind.value}>
              {kind.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
