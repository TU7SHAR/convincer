import { z } from "zod";

export const visitSections = [
  "opening",
  "memories",
  "smile",
  "timer",
  "reflection",
  "free_time",
  "accountability",
  "invitation",
  "response",
  "honesty",
] as const;

export const visitEventSchema = z
  .object({
    token: z.string().trim().min(1).max(256),
    sessionId: z.uuid(),
    consent: z.literal(true),
    consentVersion: z.literal("1"),
    eventType: z.enum([
      "session_started",
      "section_view",
      "section_exit",
      "page_exit",
      "button_click",
      "consent_choice",
    ]),
    route: z.literal("/p/[private]"),
    sectionKey: z.enum(visitSections).optional(),
    durationMs: z.number().int().nonnegative().optional(),
    scrollPct: z.number().int().min(0).max(100).optional(),
    extra: z.record(z.string(), z.unknown()).optional(),
  });

export type VisitEventInput = z.infer<typeof visitEventSchema>;
