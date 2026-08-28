import { Disclaimer } from "@/components/disclaimer";
import {
  CATEGORY_LABELS,
  EMPLOYMENT_LABELS,
  activityLabel,
} from "@/lib/reps/constants";
import {
  formatHours,
  groupEntriesByMonth,
  type YearSummary,
} from "@/lib/reps/summary";
import { formatLongDate, formatMonth, isoToHhmm } from "@/lib/date";
import type { Profile, Property, TimeEntry } from "@/lib/types";

export function PacketView({
  profile,
  year,
  summary,
  entries,
  properties,
  preparedOn,
}: {
  profile: Profile;
  year: number;
  summary: YearSummary;
  entries: TimeEntry[];
  properties: Property[];
  preparedOn: string;
}) {
  const employment = profile.real_estate_employment
    ? EMPLOYMENT_LABELS[profile.real_estate_employment]
    : "Not specified";
  const months = groupEntriesByMonth(entries);

  return (
    <article className="packet space-y-8 bg-white text-black print:space-y-6">
      <header className="border-b pb-4">
        <p className="text-xs tracking-wide text-neutral-500 uppercase">
          REPS substantiation packet
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold">
          {profile.legal_name || "Taxpayer"} — {year}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Prepared {formatLongDate(preparedOn)}
          {profile.spouse_name ? ` · Spouse: ${profile.spouse_name}` : ""}
        </p>
      </header>

      <section className="grid gap-3 text-sm">
        <h2 className="font-display text-lg font-semibold">Year summary</h2>
        <p>
          <strong>Real estate work classification:</strong> {employment}. Your
          CPA should apply IRC §469(c)(7)(D)(ii) if employee hours are involved.
        </p>
        <p>
          <strong>Grouping:</strong>{" "}
          {summary.grouped
            ? "Taxpayer is tracking all rental real estate as one activity. CPA: confirm whether the Treas. Reg. §1.469-9(g) election is in effect or needs to be made on the return."
            : "Taxpayer is tracking each rental separately. No grouping election is being used for this log."}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 text-sm">
        <div className="rounded-lg border p-3">
          <h3 className="font-medium">REPS test 1 — 750 hours</h3>
          <p className="mt-2 text-2xl font-semibold">
            {summary.reps750.hours.toFixed(2)}{" "}
            <span className="text-base font-normal text-neutral-600">
              / 750
            </span>
          </p>
          <p className="mt-1">{summary.reps750.met ? "Met" : "Not met"}</p>
          <p className="mt-2 text-neutral-600">
            Counts taxpayer real-property trade hours (if eligible) plus
            taxpayer rental hours. Spouse rental hours are excluded.
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <h3 className="font-medium">REPS test 2 — more than 50%</h3>
          <p className="mt-2 text-2xl font-semibold">
            {summary.reps50.percent === null
              ? "—"
              : `${summary.reps50.percent}%`}
          </p>
          <p className="mt-1">{summary.reps50.met ? "Met" : "Not met"}</p>
          <p className="mt-2 text-neutral-600">
            {formatHours(summary.reps50.numeratorMinutes)} real estate hours /{" "}
            {formatHours(summary.reps50.denominatorMinutes)} total personal
            services logged.
          </p>
          {summary.reps50.otherWorkUnlogged && (
            <p className="mt-2">
              No other work logged. Taxpayer represents real estate is her only
              occupation.
            </p>
          )}
        </div>
      </section>

      <section className="text-sm">
        <h2 className="font-display text-lg font-medium">
          Rental material participation
        </h2>
        <p className="mt-1 text-neutral-600">
          Spouse hours count here only. 500-hour test is computed; other tests
          listed are taxpayer claims for the CPA to review.
        </p>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-2 font-medium">Activity</th>
              <th className="py-2 pr-2 font-medium">Taxpayer</th>
              <th className="py-2 pr-2 font-medium">Spouse</th>
              <th className="py-2 pr-2 font-medium">Total</th>
              <th className="py-2 font-medium">500-hour</th>
            </tr>
          </thead>
          <tbody>
            {summary.materialParticipation.length === 0 ? (
              <tr>
                <td className="py-2" colSpan={5}>
                  No rental hours logged.
                </td>
              </tr>
            ) : (
              summary.materialParticipation.map((a) => (
                <tr key={a.propertyId ?? "grouped"} className="border-b align-top">
                  <td className="py-2 pr-2">
                    {a.name}
                    {a.otherTests.length > 0 && (
                      <div className="text-xs text-neutral-600">
                        Also claiming:{" "}
                        {a.otherTests
                          .map((t) =>
                            t.note ? `${t.label} (${t.note})` : t.label,
                          )
                          .join("; ")}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-2">
                    {formatHours(a.taxpayerMinutes)}
                  </td>
                  <td className="py-2 pr-2">{formatHours(a.spouseMinutes)}</td>
                  <td className="py-2 pr-2">{formatHours(a.totalMinutes)}</td>
                  <td className="py-2">{a.met500 ? "Met" : "Not met"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="text-sm">
        <h2 className="font-display text-lg font-medium">Hours by category</h2>
        <ul className="mt-2 grid gap-1">
          <li>
            Agent / brokerage (taxpayer):{" "}
            {formatHours(summary.categoryMinutes.real_property_trade)}
          </li>
          <li>
            Rental (taxpayer):{" "}
            {formatHours(summary.categoryMinutes.rental_taxpayer)}
          </li>
          <li>
            Rental (spouse): {formatHours(summary.categoryMinutes.rental_spouse)}
          </li>
          <li>Other job: {formatHours(summary.categoryMinutes.other_work)}</li>
        </ul>
        <p className="mt-2 text-neutral-600">
          {summary.entryCount} entries. {summary.lateLogCount} logged after the
          work date (contemporaneous logs are stronger).
        </p>
      </section>

      <section className="text-sm">
        <h2 className="font-display text-lg font-medium">Activity log</h2>
        {months.length === 0 ? (
          <p className="mt-2">No entries for {year}.</p>
        ) : (
          months.map(([month, rows]) => {
            const subtotal = rows.reduce((sum, e) => sum + e.duration_minutes, 0);
            return (
              <div key={month} className="mt-4">
                <h3 className="font-medium">
                  {formatMonth(month)}{" "}
                  <span className="font-normal text-neutral-600">
                    · {formatHours(subtotal)} hours
                  </span>
                </h3>
                <table className="mt-2 w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1 pr-2">Date</th>
                      <th className="py-1 pr-2">Time</th>
                      <th className="py-1 pr-2">Hrs</th>
                      <th className="py-1 pr-2">Who</th>
                      <th className="py-1 pr-2">Category</th>
                      <th className="py-1 pr-2">Property</th>
                      <th className="py-1">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((entry) => {
                      const property =
                        properties.find((p) => p.id === entry.property_id)
                          ?.name ?? "";
                      const time =
                        entry.started_at && entry.ended_at
                          ? `${isoToHhmm(entry.started_at)}–${isoToHhmm(entry.ended_at)}`
                          : "";
                      return (
                        <tr key={entry.id} className="border-b align-top">
                          <td className="py-1 pr-2 whitespace-nowrap">
                            {entry.occurred_on}
                          </td>
                          <td className="py-1 pr-2 whitespace-nowrap">{time}</td>
                          <td className="py-1 pr-2">
                            {formatHours(entry.duration_minutes)}
                          </td>
                          <td className="py-1 pr-2">
                            {entry.performer === "spouse" ? "Spouse" : "Taxpayer"}
                          </td>
                          <td className="py-1 pr-2">
                            {CATEGORY_LABELS[entry.category]}
                            {entry.activity_kind
                              ? ` · ${activityLabel(entry.category, entry.activity_kind)}`
                              : ""}
                          </td>
                          <td className="py-1 pr-2">{property}</td>
                          <td className="py-1">{entry.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </section>

      <footer className="border-t pt-4">
        <Disclaimer className="text-xs text-neutral-600" />
      </footer>
    </article>
  );
}
