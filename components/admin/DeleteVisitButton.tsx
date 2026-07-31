"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteVisitButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function deleteVisit() {
    const confirmed = window.confirm(
      "Delete this visit timeline permanently? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/visits/${sessionId}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "The visit could not be deleted.");
      }

      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The visit could not be deleted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-delete-control">
      <button type="button" disabled={submitting} onClick={deleteVisit}>
        {submitting ? "Deleting…" : "Delete visit"}
      </button>
      <p aria-live="polite">{error}</p>
    </div>
  );
}
