import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/disclaimer";
import { Wordmark } from "@/components/wordmark";
import { getUserIdOrNull } from "@/lib/auth";

const TESTS = [
  {
    figure: "750",
    unit: "hours",
    title: "Real property trades",
    copy: "Agent work plus your hours on rentals. Spouse hours stay out.",
  },
  {
    figure: ">50%",
    unit: "of all work",
    title: "More than half",
    copy: "Those hours vs everything you personally work. Log other jobs too.",
  },
  {
    figure: "500",
    unit: "rental hours",
    title: "Material participation",
    copy: "Per property, or grouped. REPS alone does not make a rental non-passive.",
  },
];

export default async function LandingPage() {
  const userId = await getUserIdOrNull();
  if (userId) redirect("/home");

  return (
    <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center gap-10 px-5 py-12 md:py-20">
      <div className="max-w-xl">
        <Wordmark size="lg" href="/" />
        <p className="mt-6 text-lg leading-relaxed text-ink/80">
          Log real estate hours as you work — between showings, after a punch
          list, on the hood of the car. At tax time, print a packet your CPA
          can drop in the file.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Create account</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {TESTS.map((test) => (
          <li
            key={test.figure}
            className="border-l-[3px] border-ink bg-card px-4 py-5 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_6%,transparent)] ring-1 ring-rule/80"
          >
            <p className="font-mono text-3xl font-medium tracking-tight">
              {test.figure}
              <span className="text-muted-foreground ml-1.5 text-xs font-normal tracking-normal">
                {test.unit}
              </span>
            </p>
            <p className="font-display mt-3 text-base font-semibold">
              {test.title}
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {test.copy}
            </p>
          </li>
        ))}
      </ul>

      <Disclaimer className="text-muted-foreground max-w-xl text-xs leading-relaxed" />
    </div>
  );
}
