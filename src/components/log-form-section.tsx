"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { LogForm } from "@/components/log-form";
import { cn } from "@/lib/utils";
import type { Property, TimeEntry } from "@/lib/types";

export function LogFormSection({
  properties,
  lastEntry,
  defaultOpen = false,
}: {
  properties: Property[];
  lastEntry: TimeEntry | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!defaultOpen) return;
    router.replace(pathname, { scroll: false });
  }, [defaultOpen, pathname, router]);

  return (
    <section
      className={cn(
        "bg-card overflow-hidden rounded-xl shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="add-hours-form"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
          "hover:bg-paper/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-marker/30 focus-visible:ring-inset",
          open && "border-b border-rule/70",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink text-paper">
          <PlusIcon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-semibold text-ink">
            Add hours
          </span>
          <span className="block text-muted-foreground text-sm">
            {open
              ? "Hide the form to focus on this year’s log"
              : "Log a block when you weren’t on the timer"}
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div id="add-hours-form" className="p-5">
          <LogForm
            properties={properties}
            lastEntry={lastEntry}
            className="rounded-none bg-transparent p-0 shadow-none ring-0"
          />
        </div>
      ) : null}
    </section>
  );
}
