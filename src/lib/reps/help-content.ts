export type HelpSource = {
  label: string;
  href: string;
};

export type HelpTopic = {
  title: string;
  summary: string;
  paragraphs: string[];
  sources: HelpSource[];
};

export type HelpTopicId =
  | "reps_overview"
  | "reps_750"
  | "reps_50"
  | "material_participation"
  | "non_counting"
  | "contemporaneous_log"
  | "grouping_election"
  | "w2_employee";

/**
 * Short, plain-language explainers for in-app info sheets.
 * Not tax advice — point readers to primary sources and their CPA.
 */
export const HELP_TOPICS: Record<HelpTopicId, HelpTopic> = {
  reps_overview: {
    title: "What is Real Estate Professional Status?",
    summary:
      "REPS is an IRS status that can let rental losses avoid passive-activity limits.",
    paragraphs: [
      "Under the tax code, rental real estate is usually a passive activity. Losses from passive activities are limited — you often cannot use them against W-2 or other non-passive income.",
      "If you qualify as a real estate professional and you materially participate in your rentals, those rentals can be nonpassive. That is what people mean by “REPS.”",
      "Qualifying generally requires meeting both a hours test (750+) and a more-than-half-of-services test in the tax year, plus material participation in the rentals. This app tracks hours for your CPA; it does not determine your status.",
    ],
    sources: [
      {
        label: "IRC §469(c)(7) — Real estate professionals",
        href: "https://www.law.cornell.edu/uscode/text/26/469",
      },
      {
        label: "Treas. Reg. §1.469-9 — REPS rules",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-9",
      },
      {
        label: "IRS Publication 925 — Passive Activity and At-Risk Rules",
        href: "https://www.irs.gov/publications/p925",
      },
    ],
  },
  reps_750: {
    title: "The 750-hour test",
    summary:
      "You generally need more than 750 hours in real property trades or businesses during the year.",
    paragraphs: [
      "One REPS requirement is that you perform more than 750 hours of services during the tax year in real property trades or businesses in which you materially participate.",
      "This app counts taxpayer hours logged as agent/brokerage work and rental work toward that total. “Other job” hours are kept separate so they do not inflate the 750.",
      "What counts as a qualifying hour is fact-specific. Investor-type tasks, commute, and on-call time are often challenged. Your CPA decides what belongs in the final return.",
    ],
    sources: [
      {
        label: "IRC §469(c)(7)(B)(ii) — 750-hour requirement",
        href: "https://www.law.cornell.edu/uscode/text/26/469",
      },
      {
        label: "Treas. Reg. §1.469-9(c) — Qualifying as a REPS",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-9",
      },
      {
        label: "IRS Publication 925",
        href: "https://www.irs.gov/publications/p925",
      },
    ],
  },
  reps_50: {
    title: "The more-than-50% test",
    summary:
      "More than half of your personal services in all trades or businesses must be in real property trades or businesses.",
    paragraphs: [
      "Along with 750 hours, you generally must show that more than 50% of the personal services you perform in all trades or businesses during the year are in real property trades or businesses in which you materially participate.",
      "That is why logging “Other job” hours matters. If you have a W-2 or side business and leave it out, the percentage in this app is incomplete.",
      "If real estate is truly your only trade or business, the test is often met — but only if that is accurate. Confirm with your CPA.",
    ],
    sources: [
      {
        label: "IRC §469(c)(7)(B)(i) — More than one-half of services",
        href: "https://www.law.cornell.edu/uscode/text/26/469",
      },
      {
        label: "Treas. Reg. §1.469-9(c)",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-9",
      },
      {
        label: "IRS Publication 925",
        href: "https://www.irs.gov/publications/p925",
      },
    ],
  },
  material_participation: {
    title: "Material participation in rentals",
    summary:
      "REPS alone is not enough — you also need material participation in the rental activities.",
    paragraphs: [
      "Even if you qualify as a real estate professional, rental losses are still passive unless you materially participate in the rental activity (or a grouped rental activity).",
      "A common safe harbor people watch is 500+ hours in the activity for the year. There are other material-participation tests (for example, substantially all participation, or 100 hours and not less than anyone else).",
      "This app tracks hours per property or as one grouped rental activity. Claiming a specific material-participation test on the return is still a CPA decision.",
    ],
    sources: [
      {
        label: "Treas. Reg. §1.469-5T — Material participation",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-5T",
      },
      {
        label: "Treas. Reg. §1.469-9 — REPS and rentals",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-9",
      },
      {
        label: "IRS Publication 925",
        href: "https://www.irs.gov/publications/p925",
      },
    ],
  },
  non_counting: {
    title: "Hours that often do not count",
    summary:
      "Some logged time is useful context but may not count toward REPS or material participation.",
    paragraphs: [
      "Courts and the IRS have often treated investor-type work (reviewing statements, researching deals), commute, and on-call / waiting time skeptically when someone is trying to meet hour tests.",
      "That does not mean you should never log them. A contemporaneous note can still help your CPA decide what to include or exclude. Tagging them here flags the risk.",
      "Whether a specific hour counts depends on the facts. Treat the warning as a prompt to talk with your CPA — not as a final legal answer.",
    ],
    sources: [
      {
        label: "Treas. Reg. §1.469-5T(f)(2) — Investor participation limits",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-5T",
      },
      {
        label: "IRS Publication 925 — Participation",
        href: "https://www.irs.gov/publications/p925",
      },
    ],
  },
  contemporaneous_log: {
    title: "Why a contemporaneous log matters",
    summary:
      "REPS disputes often turn on whether hours were recorded as you went.",
    paragraphs: [
      "The regulations expect a reasonable means of proving hours. A calendar, log, or appointment book kept near the time the work was done is much stronger than a reconstruction months later.",
      "For each entry, a short specific description (“met plumber at 12 Oak, replaced disposal”) is more useful in an audit than a vague label (“repairs”).",
      "Start/end times are optional here but stronger than round hours alone when your CPA builds the file. This app is a taxpayer-prepared log for substantiation — not tax advice and not a filed form.",
    ],
    sources: [
      {
        label: "Treas. Reg. §1.469-5T(f)(4) — Proof of participation",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-5T",
      },
      {
        label: "IRS Publication 925",
        href: "https://www.irs.gov/publications/p925",
      },
    ],
  },
  grouping_election: {
    title: "Grouping rental activities",
    summary:
      "You may elect to treat all rental real estate as a single activity for REPS purposes.",
    paragraphs: [
      "By default, each rental property is often its own activity. Meeting material participation on every property can be hard if hours are spread thin.",
      "Treas. Reg. §1.469-9(g) lets a qualifying real estate professional elect to treat all interests in rental real estate as a single activity. That election is generally made on the return and is often irrevocable without IRS consent.",
      "The toggle in this app only changes how hours are totaled in your tracker and packet. Your CPA still has to make or confirm the actual election on the tax return.",
    ],
    sources: [
      {
        label: "Treas. Reg. §1.469-9(g) — Grouping election",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-9",
      },
      {
        label: "IRS Publication 925",
        href: "https://www.irs.gov/publications/p925",
      },
    ],
  },
  w2_employee: {
    title: "W-2 brokerage employees",
    summary:
      "Employee hours at a real estate firm generally do not count unless you are a 5% owner.",
    paragraphs: [
      "IRC §469(c)(7)(D)(ii) generally says that services performed as an employee do not count toward REPS unless you are a 5-percent owner of the employer.",
      "If you are a W-2 agent (and not a 5% owner), those hours usually stay out of the 750-hour and 50% tests. They may still matter for the “other work” side of the 50% picture — confirm with your CPA.",
      "Update your employment type in Settings if your situation changes.",
    ],
    sources: [
      {
        label: "IRC §469(c)(7)(D)(ii) — Employees",
        href: "https://www.law.cornell.edu/uscode/text/26/469",
      },
      {
        label: "Treas. Reg. §1.469-9(c)(2) — Employees",
        href: "https://www.law.cornell.edu/cfr/text/26/1.469-9",
      },
    ],
  },
};
