import "server-only";

export type GeoResult = {
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
};

export function extractIp(headers: Headers): string | null {
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return null;
}

export async function geolocateIp(ip: string): Promise<GeoResult> {
  const empty: GeoResult = { ip, city: null, region: null, country: null, isp: null };

  if (!ip || isPrivate(ip)) return { ...empty, city: "Local network" };

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp`,
      { signal: AbortSignal.timeout(4000), cache: "no-store" }
    );
    if (!res.ok) return empty;
    const data = await res.json() as { status: string; country?: string; regionName?: string; city?: string; isp?: string };
    if (data.status !== "success") return empty;
    return { ip, city: data.city ?? null, region: data.regionName ?? null, country: data.country ?? null, isp: data.isp ?? null };
  } catch {
    return empty;
  }
}

function isPrivate(ip: string) {
  return ip === "::1" || ip === "127.0.0.1" || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("::ffff:127.");
}
