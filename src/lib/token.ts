import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

const DEVELOPMENT_TOKEN = "preview";

export function isPrivatePageTokenValid(candidate: string): boolean {
  const configured = process.env.PRIVATE_PAGE_TOKEN?.trim();

  if (!configured) {
    return process.env.NODE_ENV !== "production" && candidate === DEVELOPMENT_TOKEN;
  }

  const expectedBuffer = Buffer.from(configured);
  const candidateBuffer = Buffer.from(candidate);

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}

export function hashPrivatePageToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
