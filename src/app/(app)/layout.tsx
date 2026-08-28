import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { loadWorkspace, needsOnboarding } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, year } = await loadWorkspace();
  if (needsOnboarding(profile)) {
    redirect("/onboarding");
  }
  return <AppShell year={year}>{children}</AppShell>;
}
