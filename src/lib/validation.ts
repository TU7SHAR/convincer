import { z } from "zod";

export const responseTypes = [
  "talk",
  "need_time",
  "written_message",
  "no_contact",
] as const;

const optionalShortText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((value) => value || undefined);

export const privateResponseSchema = z
  .object({
    token: z.string().trim().min(1).max(256),
    responseType: z.enum(responseTypes),
    message: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .transform((value) => value || undefined),
    contactMethod: optionalShortText,
    preferredTime: optionalShortText,
    waitingPeriod: optionalShortText,
    replyPermission: optionalShortText,
    phoneConfirmed: z.boolean().optional(),
    website: z.string().max(200).optional(),
  })
  .superRefine((value, context) => {
    if (value.responseType === "written_message" && !value.message) {
      context.addIssue({
        code: "custom",
        path: ["message"],
        message: "Please write at least one character.",
      });
    }

    if (
      value.responseType === "talk" &&
      value.contactMethod === "phone" &&
      !value.phoneConfirmed
    ) {
      context.addIssue({
        code: "custom",
        path: ["phoneConfirmed"],
        message: "Please confirm the phone call request.",
      });
    }
  });

export type PrivateResponseInput = z.infer<typeof privateResponseSchema>;
