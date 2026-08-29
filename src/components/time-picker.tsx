"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTE_STEP = 5;
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);

type Parts = { h12: number; minute: number; am: boolean };

function parseHhmm(hhmm: string): Parts | null {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h24, minute] = hhmm.split(":").map(Number);
  return {
    h12: h24 % 12 === 0 ? 12 : h24 % 12,
    minute,
    am: h24 < 12,
  };
}

function toHhmm({ h12, minute, am }: Parts): string {
  const h24 = am ? (h12 === 12 ? 0 : h12) : h12 === 12 ? 12 : h12 + 12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplayTime(hhmm: string): string {
  const parts = parseHhmm(hhmm);
  if (!parts) return "";
  return `${parts.h12}:${String(parts.minute).padStart(2, "0")} ${parts.am ? "AM" : "PM"}`;
}

const DEFAULT_PARTS: Parts = { h12: 9, minute: 0, am: true };

function Column({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="text-muted-foreground px-2 py-1.5 text-center text-[0.7rem] font-medium tracking-wide uppercase">
        {label || "\u00a0"}
      </div>
      <div className="h-48 w-14 overflow-y-auto overscroll-contain px-1 pb-1">
        <div className="flex flex-col gap-0.5">{children}</div>
      </div>
    </div>
  );
}

function TimeOption({
  selected,
  children,
  onSelect,
}: {
  selected: boolean;
  children: ReactNode;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ block: "center" });
    }
  }, [selected]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={cn(
        "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function TimePicker({
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  "aria-invalid": ariaInvalid,
  className,
  placeholder = "Pick a time",
}: {
  id?: string;
  name: string;
  /** Controlled 24h time `HH:mm`, or `""` when empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (hhmm: string) => void;
  "aria-invalid"?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const hhmm = value ?? uncontrolled;
  const committed = parseHhmm(hhmm);
  const draft = committed ?? DEFAULT_PARTS;

  const minutes = useMemo(() => {
    if (committed && !MINUTES.includes(committed.minute)) {
      return [...MINUTES, committed.minute].sort((a, b) => a - b);
    }
    return MINUTES;
  }, [committed]);

  function commit(parts: Parts) {
    const next = toHhmm(parts);
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
  }

  return (
    <>
      <input type="hidden" name={name} value={hhmm} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={ariaInvalid || undefined}
            data-empty={!hhmm}
            className={cn(
              "border-rule h-9 w-full justify-start bg-white px-3 font-normal shadow-sm hover:bg-white hover:text-ink data-[empty=true]:text-muted-foreground",
              className,
            )}
          >
            <ClockIcon className="size-4 text-muted-foreground" />
            {hhmm ? formatDisplayTime(hhmm) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <div className="flex divide-x divide-rule/70">
            <Column label="Hour">
              {HOURS_12.map((h) => (
                <TimeOption
                  key={h}
                  selected={draft.h12 === h}
                  onSelect={() => commit({ ...draft, h12: h })}
                >
                  {h}
                </TimeOption>
              ))}
            </Column>
            <Column label="Min">
              {minutes.map((m) => (
                <TimeOption
                  key={m}
                  selected={draft.minute === m}
                  onSelect={() => commit({ ...draft, minute: m })}
                >
                  {String(m).padStart(2, "0")}
                </TimeOption>
              ))}
            </Column>
            <Column label="">
              {(
                [
                  { label: "AM", am: true },
                  { label: "PM", am: false },
                ] as const
              ).map((period) => (
                <TimeOption
                  key={period.label}
                  selected={draft.am === period.am}
                  onSelect={() => commit({ ...draft, am: period.am })}
                >
                  {period.label}
                </TimeOption>
              ))}
            </Column>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-rule/70 px-2 py-1.5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              disabled={!hhmm}
              onClick={() => {
                if (value === undefined) setUncontrolled("");
                onChange?.("");
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
