"use client";

import { CircleHelpIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HELP_TOPICS,
  type HelpTopicId,
} from "@/lib/reps/help-content";
import { cn } from "@/lib/utils";

export function InfoSheet({
  topic,
  className,
  label,
  tone = "light",
}: {
  topic: HelpTopicId;
  className?: string;
  /** Optional visible text next to the icon (e.g. “Why?”). */
  label?: string;
  tone?: "light" | "dark";
}) {
  const content = HELP_TOPICS[topic];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={label ? "sm" : "icon-xs"}
          className={cn(
            label ? "h-7 gap-1 px-2 text-xs font-medium" : "size-6",
            tone === "dark"
              ? "text-paper/70 hover:bg-paper/10 hover:text-paper"
              : "text-muted-foreground hover:text-ink",
            className,
          )}
          aria-label={`About ${content.title}`}
        >
          <CircleHelpIcon className="size-3.5" />
          {label ? <span>{label}</span> : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-rule/70">
          <SheetTitle className="font-display text-lg font-semibold tracking-tight pr-8">
            {content.title}
          </SheetTitle>
          <SheetDescription>{content.summary}</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {content.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="text-sm leading-relaxed text-ink/90"
            >
              {paragraph}
            </p>
          ))}

          <div className="rounded-lg border border-rule/80 bg-paper/60 p-3">
            <p className="text-muted-foreground mb-2 text-[11px] font-medium tracking-[0.14em] uppercase">
              Primary sources
            </p>
            <ul className="grid gap-2">
              {content.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-marker inline-flex items-start gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
                  >
                    <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span>{source.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SheetFooter className="border-t border-rule/70">
          <p className="text-muted-foreground text-xs leading-relaxed">
            This is not tax advice. REPS Helper tracks hours for substantiation;
            your CPA decides what counts on the return.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
