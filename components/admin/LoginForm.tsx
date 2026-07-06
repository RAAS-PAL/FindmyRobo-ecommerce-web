"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      setError("Wrong password. Try again.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="password" className="block text-[13px] font-semibold text-navy">
        Admin password
      </label>
      <input
        id="password"
        type="password"
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null);
        }}
        className={`min-h-[48px] w-full rounded-xl border bg-white px-4 text-[14px] text-navy transition-colors focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-200"
            : "border-navy-100 focus:border-gold focus:ring-gold/25"
        }`}
      />
      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[14px] font-bold text-navy-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        )}
        Sign In
      </button>
    </form>
  );
}
