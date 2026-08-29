"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  ClockIcon,
  FileTextIcon,
  HouseIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/home", label: "Home", icon: HouseIcon },
  { href: "/hours", label: "Hours", icon: ClockIcon },
  { href: "/properties", label: "Rentals", icon: Building2Icon },
  { href: "/packet", label: "Packet", icon: FileTextIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const MOBILE_NAV = NAV.filter((item) => item.href !== "/settings");

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-3 md:flex">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "text-ink" : "text-muted-foreground hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden />
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
      <div className="grid grid-cols-4">
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-ink" : "text-muted-foreground",
              )}
            >
              <Icon
                className={cn("size-5", active ? "stroke-[2.25]" : "stroke-2")}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
