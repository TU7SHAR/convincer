import { NextResponse } from "next/server";

import {
  isDatabaseConfigured,
  storePrivateResponse,
} from "@/src/lib/db";
import {
  hashPrivatePageToken,
  isPrivatePageTokenValid,
} from "@/src/lib/token";
import { privateResponseSchema } from "@/src/lib/validation";

const MAX_BODY_BYTES = 12_000;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return safeError(403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (
    !contentType.toLowerCase().startsWith("application/json") ||
    contentLength > MAX_BODY_BYTES
  ) {
    return safeError(400);
  }

  let body: unknown;

  try {
    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return safeError(413);
    }

    body = JSON.parse(rawBody);
  } catch {
    return safeError(400);
  }

  const parsed = privateResponseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please check the response and try again.",
      },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  if (!isPrivatePageTokenValid(parsed.data.token)) {
    return safeError(404);
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "The private reply form is not connected yet.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await storePrivateResponse(
      hashPrivatePageToken(parsed.data.token),
      parsed.data,
    );

    if (result.status === "inserted") {
      return NextResponse.json({ ok: true });
    }

    if (result.status === "closed" || result.status === "inactive") {
      return NextResponse.json(
        {
          ok: false,
          message: "This private page is no longer accepting responses.",
        },
        { status: 409 },
      );
    }

    if (result.status === "rate_limited") {
      return NextResponse.json(
        {
          ok: false,
          message: "Please wait a little before trying again.",
        },
        { status: 429 },
      );
    }

    return safeError(400);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message:
          "This could not be sent right now. Please keep the page open and try again.",
      },
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

function safeError(status: number) {
  return NextResponse.json(
    {
      ok: false,
      message: "The response could not be accepted.",
    },
    { status },
  );
}
