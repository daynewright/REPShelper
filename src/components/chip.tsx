import { cn } from "@/lib/utils";

export function Chip({
  selected,
  onClick,
  children,
  size = "default",
  className,
}: {
  selected: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  size?: "default" | "sm";
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full font-medium transition-colors",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        selected
          ? "bg-ink text-paper"
          : "bg-white/80 text-ink ring-1 ring-rule hover:bg-white",
        className,
      )}
    >
      {children}
    </button>
  );
}
