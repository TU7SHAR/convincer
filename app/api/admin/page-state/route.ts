import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/src/lib/admin-auth";
import { setPrivatePageActive } from "@/src/lib/admin-db";
import { hashPrivatePageToken } from "@/src/lib/token";

const pageStateSchema = z.object({
  isActive: z.boolean(),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = pageStateSchema.safeParse(body);
  const token = process.env.PRIVATE_PAGE_TOKEN?.trim();

  if (!parsed.success || !token) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await setPrivatePageActive(
      hashPrivatePageToken(token),
      parsed.data.isActive,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/page-state] update failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { ok: false, message: "The page state could not be updated." },
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
