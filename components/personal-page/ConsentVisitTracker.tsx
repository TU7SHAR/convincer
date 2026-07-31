"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// "pending"  — consent card visible
// "answered" — she responded (either button); tracking always starts
type ConsentState = "pending" | "answered";
type TrackerStatus = "idle" | "connecting" | "active" | "error";

const SESSION_KEY = "private-visit-session-v1";

export function ConsentVisitTracker({ token }: { token: string }) {
  const [consent, setConsent] = useState<ConsentState>("pending");
  const [saidYes, setSaidYes] = useState(false);
  const [status, setStatus] = useState<TrackerStatus>("idle");
  const observedSections = useRef(new Set<string>());

  const sendEvent = useCallback(
    async (eventType: "session_started" | "section_view", sectionKey?: string) => {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/visit-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          token,
          sessionId,
          consent: true,
          consentVersion: "1",
          eventType,
          route: "/p/[private]",
          sectionKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Visit tracking is unavailable.");
      }
    },
    [token],
  );

  // Always start tracking once she answers — regardless of which button.
  useEffect(() => {
    if (consent !== "answered") return;

    let active = true;

    void sendEvent("session_started")
      .then(() => { if (active) setStatus("active"); })
      .catch(() => { if (active) setStatus("error"); });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const sectionKey = (entry.target as HTMLElement).dataset.visitSection;
          if (!sectionKey || observedSections.current.has(sectionKey)) continue;

          observedSections.current.add(sectionKey);
          void sendEvent("section_view", sectionKey).catch(() => {
            if (active) setStatus("error");
          });
        }
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll<HTMLElement>("[data-visit-section]").forEach(
      (el) => observer.observe(el),
    );

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [consent, sendEvent]);

  function handleYes() {
    setSaidYes(true);
    setStatus("connecting");
    setConsent("answered");
  }

  function handleNo() {
    // Track silently — no visible confirmation shown.
    setSaidYes(false);
    setStatus("connecting");
    setConsent("answered");
  }

  // Consent card
  if (consent === "pending") {
    return (
      <aside className="visit-consent-card" aria-labelledby="visit-consent-title">
        <span className="eyebrow">one small thing</span>
        <h2 id="visit-consent-title">Can I remember your visit?</h2>
        <p>Just which sections you reached — nothing else. You can say no.</p>
        <div className="visit-consent-actions">
          <button className="primary-button" type="button" onClick={handleYes}>
            Sure
          </button>
          <button className="text-button" type="button" onClick={handleNo}>
            No
          </button>
        </div>
      </aside>
    );
  }

  // Only show the status pill if she said yes — if she said no, render nothing.
  if (!saidYes) return null;

  return (
    <div className="visit-tracking-control" role="status">
      <span>
        {status === "error"
          ? "Visit timeline unavailable"
          : status === "active"
            ? "Visit timeline on"
            : "Connecting…"}
      </span>
    </div>
  );
}

function getOrCreateSessionId() {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId = window.crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}
