import { Wordmark } from "@/components/wordmark";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col">
      <header className="px-5 py-5">
        <Wordmark href="/" />
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16">
        {children}
      </div>
    </div>
  );
}
