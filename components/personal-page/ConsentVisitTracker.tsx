"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ConsentState = "pending" | "answered";
type TrackerStatus = "idle" | "connecting" | "active" | "error";

const SESSION_KEY = "private-visit-session-v1";

type EventPayload = {
  eventType: string;
  sectionKey?: string;
  durationMs?: number;
  scrollPct?: number;
  extra?: Record<string, unknown>;
};

export function ConsentVisitTracker({ token }: { token: string }) {
  const [consent, setConsent] = useState<ConsentState>("pending");
  const [saidYes, setSaidYes] = useState(false);
  const [status, setStatus] = useState<TrackerStatus>("idle");

  // Track when each section became visible
  const sectionEnteredAt = useRef<Map<string, number>>(new Map());
  const observedSections = useRef(new Set<string>());
  // Track max scroll depth
  const maxScrollPct = useRef(0);
  // Page entry time
  const pageEnteredAt = useRef<number>(Date.now());

  const sendEvent = useCallback(
    async (payload: EventPayload) => {
      const sessionId = getOrCreateSessionId();
      await fetch("/api/visit-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          token,
          sessionId,
          consent: true,
          consentVersion: "1",
          route: "/p/[private]",
          ...payload,
        }),
      });
    },
    [token],
  );

  // Main tracking effect — runs as soon as she answers either button
  useEffect(() => {
    if (consent !== "answered") return;

    let active = true;
    pageEnteredAt.current = Date.now();

    // 1. Session start
    void sendEvent({ eventType: "session_started" })
      .then(() => { if (active) setStatus("active"); })
      .catch(() => { if (active) setStatus("error"); });

    // 2. Section visibility — enter + exit with time spent
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const key = el.dataset.visitSection;
          if (!key) continue;

          if (entry.isIntersecting) {
            // Section entered
            sectionEnteredAt.current.set(key, Date.now());
            if (!observedSections.current.has(key)) {
              observedSections.current.add(key);
              void sendEvent({ eventType: "section_view", sectionKey: key as never });
            }
          } else {
            // Section exited — record time spent
            const enteredAt = sectionEnteredAt.current.get(key);
            if (enteredAt) {
              const durationMs = Date.now() - enteredAt;
              sectionEnteredAt.current.delete(key);
              if (durationMs > 500) { // ignore blips
                void sendEvent({
                  eventType: "section_exit",
                  sectionKey: key as never,
                  durationMs,
                });
              }
            }
          }
        }
      },
      { threshold: [0, 0.12, 1] },
    );

    document.querySelectorAll<HTMLElement>("[data-visit-section]").forEach(
      (el) => sectionObserver.observe(el),
    );

    // 3. Scroll depth tracking
    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);
      if (pct > maxScrollPct.current) maxScrollPct.current = pct;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // 4. Button click tracking — watch all buttons/links on the page
    function onButtonClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("button, a");
      if (!target) return;
      const label =
        target.getAttribute("data-track-label") ||
        (target as HTMLElement).innerText?.trim().slice(0, 60) ||
        target.getAttribute("aria-label") ||
        "unknown";
      void sendEvent({
        eventType: "button_click",
        extra: { label, tag: target.tagName.toLowerCase() },
      });
    }
    document.addEventListener("click", onButtonClick, { capture: true });

    // 5. Page exit — tab hidden or closed
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        const totalMs = Date.now() - pageEnteredAt.current;
        // Fire any open section exits
        for (const [key, enteredAt] of sectionEnteredAt.current.entries()) {
          const durationMs = Date.now() - enteredAt;
          navigator.sendBeacon(
            "/api/visit-events",
            JSON.stringify({
              token,
              sessionId: getOrCreateSessionId(),
              consent: true,
              consentVersion: "1",
              route: "/p/[private]",
              eventType: "section_exit",
              sectionKey: key,
              durationMs,
            }),
          );
        }
        // Fire page_exit
        navigator.sendBeacon(
          "/api/visit-events",
          JSON.stringify({
            token,
            sessionId: getOrCreateSessionId(),
            consent: true,
            consentVersion: "1",
            route: "/p/[private]",
            eventType: "page_exit",
            durationMs: totalMs,
            scrollPct: maxScrollPct.current,
          }),
        );
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onButtonClick, { capture: true });
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [consent, sendEvent, token]);

  function handleYes() {
    setSaidYes(true);
    setStatus("connecting");
    setConsent("answered");
    void fetch("/api/visit-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        token,
        sessionId: getOrCreateSessionId(),
        consent: true,
        consentVersion: "1",
        route: "/p/[private]",
        eventType: "consent_choice",
        extra: { choice: "yes" },
      }),
    });
  }

  function handleNo() {
    setSaidYes(false);
    setStatus("connecting");
    setConsent("answered");
    void fetch("/api/visit-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        token,
        sessionId: getOrCreateSessionId(),
        consent: true,
        consentVersion: "1",
        route: "/p/[private]",
        eventType: "consent_choice",
        extra: { choice: "no" },
      }),
    });
  }

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
