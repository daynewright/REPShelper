import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  href = "/",
  size = "default",
}: {
  href?: string;
  size?: "default" | "lg";
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid place-items-center rounded-md bg-ink font-display font-bold tracking-wider text-paper",
          size === "lg" ? "size-11 text-xs" : "size-9 text-[10px]",
        )}
      >
        750
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "font-display block font-semibold tracking-tight",
            size === "lg" ? "text-2xl" : "text-lg",
          )}
        >
          REPS Helper
        </span>
        {size === "lg" && (
          <span className="text-muted-foreground mt-1 block text-xs tracking-[0.16em] uppercase">
            Hours ledger
          </span>
        )}
      </span>
    </Link>
  );
}
