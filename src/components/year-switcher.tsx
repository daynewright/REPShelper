"use client";

import { useTransition } from "react";
import { currentTaxYear } from "@/lib/date";
import { setYearAction } from "@/lib/actions/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function YearSwitcher({ year }: { year: number }) {
  const [pending, start] = useTransition();
  const years = [0, 1, 2].map((offset) => currentTaxYear() - offset);

  return (
    <Select
      value={String(year)}
      disabled={pending}
      onValueChange={(value) => {
        const fd = new FormData();
        fd.set("year", value);
        start(() => setYearAction(fd));
      }}
    >
      <SelectTrigger
        className="w-[6.75rem] border-rule/80 bg-white font-mono text-sm"
        aria-label="Tax year"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
