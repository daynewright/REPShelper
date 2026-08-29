import * as React from "react"
import { CalendarIcon, ClockIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const inputClassName =
  "h-9 w-full min-w-0 rounded-lg border border-rule bg-white px-3 py-1 text-base text-ink shadow-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-marker focus-visible:ring-3 focus-visible:ring-marker/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:border-input dark:bg-card dark:text-foreground dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  if (type === "date" || type === "time") {
    const Icon = type === "date" ? CalendarIcon : ClockIcon
    return (
      <div className="relative">
        <input
          type={type}
          data-slot="input"
          className={cn(
            inputClassName,
            "scheme-light appearance-none pr-9 font-normal tabular-nums",
            // Hide the native indicator but keep it clickable over the field.
            "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
            className
          )}
          {...props}
        />
        <Icon
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    )
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClassName, className)}
      {...props}
    />
  )
}

export { Input }
