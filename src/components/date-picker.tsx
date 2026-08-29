"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatLongDate, parseISODate, todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";

export function DatePicker({
  id,
  name,
  value,
  defaultValue,
  onChange,
  "aria-invalid": ariaInvalid,
  className,
}: {
  id?: string;
  name: string;
  /** Controlled ISO date `YYYY-MM-DD`. */
  value?: string;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  "aria-invalid"?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? todayISO(),
  );
  const iso = value ?? uncontrolled;
  const selected = iso ? parseISODate(iso) : undefined;

  return (
    <>
      <input type="hidden" name={name} value={iso} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={ariaInvalid || undefined}
            data-empty={!iso}
            className={cn(
              "border-rule h-9 w-full justify-start bg-white px-3 font-normal shadow-sm hover:bg-white hover:text-ink data-[empty=true]:text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {iso ? formatLongDate(iso) : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) return;
              const next = todayISO(date);
              if (value === undefined) setUncontrolled(next);
              onChange?.(next);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
