import "server-only";

import nodemailer from "nodemailer";

export type PageLoadRecord = {
  loadedAt: Date;
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
};

export async function sendPageVisitEmail(record: PageLoadRecord) {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  const to   = process.env.NOTIFY_EMAIL?.trim() || user;

  if (!user || !pass || !to) {
    console.warn("[email] GMAIL_USER / GMAIL_APP_PASSWORD / NOTIFY_EMAIL not set — skipping");
    return;
  }

  const timeStr = record.loadedAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const locationParts = [record.city, record.region, record.country].filter(Boolean);
  const locationStr  = locationParts.length > 0 ? locationParts.join(", ") : "Unknown";
  const ispStr  = record.isp ?? "Unknown";
  const ipStr   = record.ip  ?? "Unknown";

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transport.sendMail({
    from: `"Convincer" <${user}>`,
    to,
    subject: "She opened the page",
    text: ["The private page was opened.", "", `Time:     ${timeStr} IST`, `Location: ${locationStr}`, `ISP:      ${ispStr}`, `IP:       ${ipStr}`].join("\n"),
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2 style="color:#c0392b">She opened the page</h2><table style="border-collapse:collapse;width:100%;font-size:14px"><tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:90px">Time</td><td style="padding:8px 12px;background:#f9f9f9">${timeStr} IST</td></tr><tr><td style="padding:8px 12px;font-weight:600">Location</td><td style="padding:8px 12px">${locationStr}</td></tr><tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">ISP</td><td style="padding:8px 12px;background:#f9f9f9">${ispStr}</td></tr><tr><td style="padding:8px 12px;font-weight:600">IP</td><td style="padding:8px 12px;color:#999">${ipStr}</td></tr></table></div>`,
  });
}
