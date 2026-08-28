"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/home", label: "Home" },
  { href: "/log", label: "Log" },
  { href: "/activity", label: "Activity" },
  { href: "/properties", label: "Rentals" },
  { href: "/packet", label: "Packet" },
  { href: "/settings", label: "Settings" },
] as const;

const MOBILE_NAV = NAV.filter((item) => item.href !== "/settings");

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto hidden max-w-4xl gap-1 overflow-x-auto px-3 md:flex">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "text-ink" : "text-muted-foreground hover:text-ink",
            )}
          >
            {item.label}
            {active ? (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-ink" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-rule/80 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                active ? "text-ink" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-1 w-6 rounded-full",
                  active ? "bg-ink" : "bg-transparent",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
