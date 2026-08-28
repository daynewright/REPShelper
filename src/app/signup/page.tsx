import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
import { AuthFrame } from "@/components/auth-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthFrame>
      <div className="grid gap-6">
        <div>
          <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            Start a contemporaneous log
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            One login tracks one taxpayer. Spouse rental hours can be logged on
            your entries.
          </p>
        </div>
        {params.error && (
          <p className="text-destructive text-sm">{params.error}</p>
        )}
        <form action={signUpAction} className="grid gap-4">
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
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="h-11 w-full">
            Create account
          </Button>
        </form>
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}
