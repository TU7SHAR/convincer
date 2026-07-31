import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/src/lib/db";
import {
  storeConsentedVisitEvent,
  storeVisitNotificationResult,
} from "@/src/lib/admin-db";
import {
  hashPrivatePageToken,
  isPrivatePageTokenValid,
} from "@/src/lib/token";
import {
  getSmtpNotificationStatus,
  sendVisitNotification,
} from "@/src/lib/visit-notifications";
import { visitEventSchema } from "@/src/lib/visit-validation";

const MAX_BODY_BYTES = 2_000;

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (
    !contentType.toLowerCase().startsWith("application/json") ||
    contentLength > MAX_BODY_BYTES
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let body: unknown;

  try {
    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = visitEventSchema.safeParse(body);

  if (!parsed.success || !isPrivatePageTokenValid(parsed.data.token)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Visit storage is not connected." },
      { status: 503 },
    );
  }

  try {
    const storedEvent = await storeConsentedVisitEvent(
      hashPrivatePageToken(parsed.data.token),
      parsed.data,
    );

    if (!storedEvent) {
      return NextResponse.json({
        ok: true,
        stored: false,
        notificationSent: false,
      });
    }

    if (!getSmtpNotificationStatus().configured) {
      return NextResponse.json({
        ok: true,
        stored: true,
        notificationSent: false,
      });
    }

    try {
      await sendVisitNotification({
        eventType: parsed.data.eventType,
        sectionKey: parsed.data.sectionKey,
        createdAt: storedEvent.createdAt,
      });
      await storeVisitNotificationResult(storedEvent.id, { sent: true });

      return NextResponse.json({
        ok: true,
        stored: true,
        notificationSent: true,
      });
    } catch (notificationError) {
      const errorMessage =
        notificationError instanceof Error
          ? notificationError.message
          : String(notificationError);

      await storeVisitNotificationResult(storedEvent.id, {
        sent: false,
        error: errorMessage,
      }).catch((statusError) => {
        console.error("[api/visit-events] notification status save failed", {
          eventId: storedEvent.id,
          error:
            statusError instanceof Error
              ? statusError.message
              : String(statusError),
        });
      });
      console.error("[api/visit-events] SMTP notification failed", {
        eventType: parsed.data.eventType,
        sectionKey: parsed.data.sectionKey ?? null,
        error: errorMessage,
      });

      return NextResponse.json({
        ok: true,
        stored: true,
        notificationSent: false,
      });
    }
  } catch (error) {
    console.error("[api/visit-events] consented event failed", {
      eventType: parsed.data.eventType,
      sectionKey: parsed.data.sectionKey ?? null,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { ok: false, message: "Visit storage is temporarily unavailable." },
      { status: 500 },
    );
  }
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
