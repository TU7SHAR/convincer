import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/src/lib/admin-auth";
import { deleteVisitSession } from "@/src/lib/admin-db";
import { hashPrivatePageToken } from "@/src/lib/token";

const sessionIdSchema = z.uuid();

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/admin/visits/[sessionId]">,
) {
  if (!isSameOriginRequest(request) || !(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const parsedSessionId = sessionIdSchema.safeParse(sessionId);
  const token = process.env.PRIVATE_PAGE_TOKEN?.trim();

  if (!parsedSessionId.success || !token) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const deleted = await deleteVisitSession(
      hashPrivatePageToken(token),
      parsedSessionId.data,
    );

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    console.error("[api/admin/visits] delete failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { ok: false, message: "The visit could not be deleted." },
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
