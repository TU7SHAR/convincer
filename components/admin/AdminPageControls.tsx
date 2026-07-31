"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminPageControls({
  isActive,
  isClosed,
}: {
  isActive: boolean;
  isClosed: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function updatePageState(nextActiveState: boolean) {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/page-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActiveState }),
      });
      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "The page state could not be changed.");
      }

      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The page state could not be changed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-page-controls">
      <button
        type="button"
        disabled={submitting || isClosed}
        onClick={() => updatePageState(!isActive)}
      >
        {submitting
          ? "Updating…"
          : isActive
            ? "Pause private page"
            : "Activate private page"}
      </button>
      {isClosed ? (
        <small>
          The page was closed by a no-contact response and cannot be reopened
          here.
        </small>
      ) : null}
      <p aria-live="polite">{error}</p>
    </div>
  );
}
