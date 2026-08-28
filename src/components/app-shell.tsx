import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import { Disclaimer } from "@/components/disclaimer";
import { YearSwitcher } from "@/components/year-switcher";
import { Wordmark } from "@/components/wordmark";
import { TopNav, MobileNav } from "@/components/nav-links";
import { Button } from "@/components/ui/button";
import { isDevBypass } from "@/lib/dev-bypass";

export function AppShell({
  year,
  children,
}: {
  year: number;
  children: React.ReactNode;
}) {
  const bypass = isDevBypass();
  return (
    <div className="flex min-h-full flex-col">
      {bypass ? (
        <div className="no-print bg-live/20 px-3 py-1.5 text-center text-[11px] font-medium tracking-wide text-ink">
          Local bypass on — demo data only, not Supabase
        </div>
      ) : null}
      <header className="no-print sticky top-0 z-20 border-b border-rule/70 bg-paper/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Wordmark href="/home" />
          <div className="flex items-center gap-1 sm:gap-2">
            <YearSwitcher year={year} />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              <Link href="/settings">Settings</Link>
            </Button>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <TopNav />
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-28 md:pb-8">
        {children}
      </main>
      <footer className="no-print mx-auto hidden w-full max-w-4xl px-4 pb-8 md:block">
        <Disclaimer />
      </footer>
      <MobileNav />
    </div>
  );
}
