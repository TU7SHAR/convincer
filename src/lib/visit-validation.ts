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
] as const;

export const visitEventSchema = z
  .object({
    token: z.string().trim().min(1).max(256),
    sessionId: z.uuid(),
    consent: z.literal(true),
    consentVersion: z.literal("1"),
    eventType: z.enum(["session_started", "section_view"]),
    route: z.literal("/p/[private]"),
    sectionKey: z.enum(visitSections).optional(),
  })
  .superRefine((value, context) => {
    if (value.eventType === "section_view" && !value.sectionKey) {
      context.addIssue({
        code: "custom",
        path: ["sectionKey"],
        message: "A section key is required for section views.",
      });
    }

    if (value.eventType === "session_started" && value.sectionKey) {
      context.addIssue({
        code: "custom",
        path: ["sectionKey"],
        message: "Session start events cannot include a section.",
      });
    }
  });

export type VisitEventInput = z.infer<typeof visitEventSchema>;
