"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "Admin login failed.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Admin login failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <label htmlFor="admin-password">Admin password</label>
      <input
        id="admin-password"
        type="password"
        value={password}
        autoComplete="current-password"
        required
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Checking…" : "Open super admin"}
      </button>
      <p aria-live="polite">{error}</p>
    </form>
  );
}
