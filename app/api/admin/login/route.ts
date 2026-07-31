import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createAdminSession,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/src/lib/admin-auth";

const loginSchema = z.object({
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Admin access is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    return NextResponse.json(
      { ok: false, message: "That password is not correct." },
      { status: 401 },
    );
  }

  await createAdminSession();

  return NextResponse.json({ ok: true });
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
