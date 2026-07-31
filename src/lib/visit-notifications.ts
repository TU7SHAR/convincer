import "server-only";

import nodemailer from "nodemailer";

import type { VisitEventInput } from "@/src/lib/visit-validation";

type SmtpConfiguration = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  to: string;
};

type VisitNotificationInput = Pick<
  VisitEventInput,
  "eventType" | "sectionKey"
> & {
  createdAt: string;
};

const sectionLabels: Record<string, string> = {
  opening: "Opening",
  memories: "Memories",
  smile: "Smile",
  timer: "Time apart",
  reflection: "Reflection",
  free_time: "Free-time note",
  accountability: "Accountability",
  invitation: "Invitation",
  response: "Response and contact",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "full",
  timeStyle: "long",
  timeZone: "Asia/Kolkata",
});

export function getSmtpNotificationStatus() {
  const { configuration, missing } = readSmtpConfiguration();

  return {
    configured: Boolean(configuration),
    missing,
  };
}

export async function sendVisitNotification(
  input: VisitNotificationInput,
) {
  const { configuration, missing } = readSmtpConfiguration();

  if (!configuration) {
    throw new Error(`SMTP is not configured: ${missing.join(", ")}`);
  }

  const eventLabel =
    input.eventType === "session_started"
      ? "Visit timeline allowed"
      : `Reached ${sectionLabels[input.sectionKey ?? ""] ?? "a page section"}`;
  const occurredAt = formatDate(input.createdAt);
  const transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,
    requireTLS: !configuration.secure,
    auth: {
      user: configuration.user,
      pass: configuration.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transporter.sendMail({
    from: configuration.from,
    to: configuration.to,
    subject: "Your site is being reviewed",
    text: [
      "A visitor explicitly allowed the private page to remember this visit.",
      "",
      `Update: ${eventLabel}`,
      `Time: ${occurredAt}`,
      "",
      "Open the super admin to review the consented visit timeline.",
    ].join("\n"),
    html: `
      <div style="background:#fff6f8;color:#34252b;font-family:Arial,sans-serif;padding:32px">
        <div style="background:#ffffff;border:1px solid #f3ccd8;border-radius:18px;margin:auto;max-width:560px;padding:28px">
          <p style="color:#a34768;font-size:12px;font-weight:700;letter-spacing:.12em;margin:0 0 12px;text-transform:uppercase">
            Private page update
          </p>
          <h1 style="font-size:26px;margin:0 0 18px">Your site is being reviewed</h1>
          <p style="line-height:1.6;margin:0 0 18px">
            A visitor explicitly allowed the private page to remember this visit.
          </p>
          <p style="background:#fff6f8;border-radius:12px;line-height:1.6;margin:0;padding:16px">
            <strong>${escapeHtml(eventLabel)}</strong><br />
            ${escapeHtml(occurredAt)}
          </p>
          <p style="color:#806b73;font-size:13px;line-height:1.6;margin:18px 0 0">
            Open the super admin to review the consented visit timeline.
          </p>
        </div>
      </div>
    `,
  });
}

function readSmtpConfiguration(): {
  configuration: SmtpConfiguration | null;
  missing: string[];
} {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  const portValue = process.env.SMTP_PORT?.trim() ?? "";
  const port = Number(portValue);
  const user = process.env.SMTP_USER?.trim() ?? "";
  const password = process.env.SMTP_PASSWORD?.trim() ?? "";
  const from = process.env.SMTP_FROM?.trim() || user;
  const to =
    process.env.VISIT_NOTIFICATION_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "";
  const missing: string[] = [];

  if (!host) missing.push("SMTP_HOST");
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    missing.push("SMTP_PORT");
  }
  if (!user) missing.push("SMTP_USER");
  if (!password) missing.push("SMTP_PASSWORD");
  if (!from) missing.push("SMTP_FROM");
  if (!to) missing.push("VISIT_NOTIFICATION_EMAIL");

  if (missing.length > 0) {
    return { configuration: null, missing };
  }

  return {
    configuration: {
      host,
      port,
      secure: parseBoolean(process.env.SMTP_SECURE) ?? port === 465,
      user,
      password,
      from,
      to,
    },
    missing,
  };
}

function parseBoolean(value: string | undefined) {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return undefined;
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}
