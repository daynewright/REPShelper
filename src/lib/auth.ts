import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEV_EMAIL, DEV_USER_ID, isDevBypass } from "@/lib/dev-bypass";

export async function requireUser() {
  if (isDevBypass()) {
    const supabase = await createClient();
    return { supabase, userId: DEV_USER_ID, email: DEV_EMAIL };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (error || !userId) {
    redirect("/login");
  }
  const email = (data?.claims?.email as string | undefined) ?? null;
  return { supabase, userId, email };
}

export async function getUserIdOrNull() {
  if (isDevBypass()) return DEV_USER_ID;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    return (data?.claims?.sub as string | undefined) ?? null;
  } catch {
    return null;
  }
}
