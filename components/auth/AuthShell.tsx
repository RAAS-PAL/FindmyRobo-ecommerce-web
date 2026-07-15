import { Bot } from "lucide-react";

/** Centered card shell shared by the login and signup pages. */
export default function AuthShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-cloud px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-forest-950 text-gold">
            <Bot className="h-5.5 w-5.5" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{sub}</p>
        </div>
        <div className="rounded-3xl border border-forest-100 bg-surface p-7 shadow-[0_16px_40px_-20px_rgba(10,46,31,0.25)] sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
