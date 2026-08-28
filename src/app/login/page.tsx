import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";
import { AuthFrame } from "@/components/auth-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; checkEmail?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthFrame>
      <div className="grid gap-6">
        <div>
          <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            Tax year log
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Continue logging hours for this tax year.
          </p>
        </div>
        {params.checkEmail && (
          <p className="rounded-xl bg-sold/10 px-3 py-2.5 text-sm text-sold">
            Check your email to confirm the account, then sign in.
          </p>
        )}
        {params.error && (
          <p className="text-destructive text-sm">{params.error}</p>
        )}
        <form action={signInAction} className="grid gap-4">
          <input type="hidden" name="next" value={params.next ?? "/home"} />
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" size="lg">
            Sign in
          </Button>
        </form>
        <p className="text-muted-foreground text-sm">
          No account?{" "}
          <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}
