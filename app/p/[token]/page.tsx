import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PersonalExperience } from "@/components/personal-page/PersonalExperience";
import { personalPageContent } from "@/src/content/personal-page";
import { recordPageLoad } from "@/src/lib/admin-db";
import { getTokenState, isDatabaseConfigured } from "@/src/lib/db";
import { sendPageVisitEmail } from "@/src/lib/email";
import { extractIp, geolocateIp } from "@/src/lib/geolocation";
import { hashPrivatePageToken, isPrivatePageTokenValid } from "@/src/lib/token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: personalPageContent.metadata.title,
  description: personalPageContent.metadata.description,
  robots: { index: false, follow: false, nocache: true, noarchive: true, noimageindex: true },
  openGraph: { title: personalPageContent.metadata.title, description: personalPageContent.metadata.description, images: [] },
};

type PrivatePageProps = { params: Promise<{ token: string }> };

export default async function PrivatePage({ params }: PrivatePageProps) {
  const { token } = await params;

  if (!isPrivatePageTokenValid(token)) notFound();

  const tokenHash = hashPrivatePageToken(token);

  let state = { exists: false, isActive: true, isClosed: false, closedReason: null as string | null, storageAvailable: false };
  try {
    state = await getTokenState(tokenHash);
  } catch (error) {
    console.error("[private-page] token state check failed", { error: error instanceof Error ? error.message : String(error) });
  }

  // Record page load + send email on every visit — no consent needed.
  if (isDatabaseConfigured()) {
    const reqHeaders = await headers();
    const ip = extractIp(reqHeaders);
    void (async () => {
      try {
        const geo = await geolocateIp(ip ?? "");
        const record = await recordPageLoad(tokenHash, geo);
        await sendPageVisitEmail(record);
        console.log("[private-page] visit recorded and email sent");
      } catch (err) {
        console.error("[private-page] record/email failed", { error: err instanceof Error ? err.message : String(err) });
      }
    })();
  }

  if (state.exists && !state.isActive) notFound();

  if (state.isClosed) {
    const copy = personalPageContent.finalMessages.closed;
    return (
      <main className="quiet-exit">
        <div className="quiet-exit-card">
          <span className="eyebrow">This private page is closed</span>
          <h1>{copy.heading}</h1>
          <p>{copy.body}</p>
        </div>
      </main>
    );
  }

  return (
    <PersonalExperience
      token={token}
      separationDate={process.env.SEPARATION_DATE ?? "2026-07-05T00:00:00+05:30"}
      contactLinks={buildContactLinks()}
      storageAvailable={state.storageAvailable}
    />
  );
}

function buildContactLinks() {
  const links: { whatsapp?: string; instagram?: string; email?: string } = {};
  const rawWhatsapp = process.env.WHATSAPP_NUMBER?.trim() ?? "";
  const digits = rawWhatsapp.replace(/\D/g, "");
  const whatsappNumber = !rawWhatsapp.startsWith("+") && digits.length === 10 ? ("91" + digits) : digits;
  const instagramUrl = process.env.INSTAGRAM_URL;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (whatsappNumber) {
    links.whatsapp = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent("Hey, I saw what you made. We can talk.");
  }
  if (instagramUrl?.startsWith("https://")) links.instagram = instagramUrl;
  if (contactEmail) {
    links.email = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(contactEmail) + "&su=" + encodeURIComponent("I saw the site") + "&body=" + encodeURIComponent("Hey Tushar, I saw what you made. We can talk.");
  }
  return links;
}