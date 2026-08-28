import { loadWorkspace } from "@/lib/data";
import { entriesToCsv } from "@/lib/reps/csv";

export async function GET() {
  const { entries, properties, year } = await loadWorkspace();
  const csv = entriesToCsv(entries, properties);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reps-${year}-log.csv"`,
    },
  });
}
