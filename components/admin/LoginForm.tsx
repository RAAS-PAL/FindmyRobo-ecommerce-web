"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const t = useTranslations("admin.login");
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(t("errors.invalidCredentials"));
      setBusy(false);
      return;
    }

    // Only admins may enter the panel — verify the role, else sign back out.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError(t("errors.noAccess"));
      setBusy(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  const fieldClass = (invalid: boolean) =>
    `min-h-[48px] w-full rounded-xl border bg-surface px-4 text-[14px] text-content transition-colors focus:outline-none focus:ring-2 ${
      invalid
        ? "border-red-400 focus:ring-red-200"
        : "border-forest-100 focus:border-gold focus:ring-gold/25"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-content">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          className={fieldClass(!!error)}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-content">
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          className={fieldClass(!!error)}
        />
      </div>
      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || email.length === 0 || password.length === 0}
        className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[14px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        )}
        {t("submit")}
      </button>
    </form>
  );
}
