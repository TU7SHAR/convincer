import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PersonalExperience } from "@/components/personal-page/PersonalExperience";
import { personalPageContent } from "@/src/content/personal-page";
import { getTokenState } from "@/src/lib/db";
import {
  hashPrivatePageToken,
  isPrivatePageTokenValid,
} from "@/src/lib/token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: personalPageContent.metadata.title,
  description: personalPageContent.metadata.description,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    noimageindex: true,
  },
  openGraph: {
    title: personalPageContent.metadata.title,
    description: personalPageContent.metadata.description,
    images: [],
  },
};

type PrivatePageProps = {
  params: Promise<{ token: string }>;
};

export default async function PrivatePage({ params }: PrivatePageProps) {
  const { token } = await params;

  if (!isPrivatePageTokenValid(token)) {
    notFound();
  }

  const tokenHash = hashPrivatePageToken(token);
  let state = {
    exists: false,
    isActive: true,
    isClosed: false,
    closedReason: null as string | null,
    storageAvailable: false,
  };

  try {
    state = await getTokenState(tokenHash);
  } catch {
    // The experience remains previewable before the database schema is installed.
  }

  if (state.exists && !state.isActive) {
    notFound();
  }

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
      separationDate={
        process.env.SEPARATION_DATE ?? "2026-07-05T00:00:00+05:30"
      }
      contactLinks={buildContactLinks()}
      storageAvailable={state.storageAvailable}
    />
  );
}

function buildContactLinks() {
  const links: {
    whatsapp?: string;
    instagram?: string;
    email?: string;
  } = {};
  const whatsappNumber = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");
  const instagramUrl = process.env.INSTAGRAM_URL;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (whatsappNumber) {
    const message = encodeURIComponent(
      "Hey, I saw what you made. We can talk.",
    );
    links.whatsapp = `https://wa.me/${whatsappNumber}?text=${message}`;
  }

  if (instagramUrl?.startsWith("https://")) {
    links.instagram = instagramUrl;
  }

  if (contactEmail) {
    const subject = encodeURIComponent("I saw the site");
    const body = encodeURIComponent(
      "Hey Tushar, I saw what you made. We can talk.",
    );
    links.email = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }

  return links;
}
