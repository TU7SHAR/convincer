"use client";

import Link from "next/link";
import { useState } from "react";

import { MemoryMedia } from "@/components/personal-page/MemoryMedia";
import {
  ResponseHub,
  type ContactLinks,
} from "@/components/personal-page/ResponseHub";
import { SeparationTimer } from "@/components/personal-page/SeparationTimer";
import {
  enabledMemories,
  personalPageContent,
} from "@/src/content/personal-page";

type PersonalExperienceProps = {
  token: string;
  separationDate: string;
  contactLinks: ContactLinks;
  storageAvailable: boolean;
};

export function PersonalExperience({
  token,
  separationDate,
  contactLinks,
  storageAvailable,
}: PersonalExperienceProps) {
  const [started, setStarted] = useState(false);
  const [quietExit, setQuietExit] = useState(false);

  function openExperience() {
    setStarted(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("memories")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function openResponseHub() {
    setStarted(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById("response")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (quietExit) {
    const copy = personalPageContent.finalMessages.quietExit;

    return (
      <main className="quiet-exit">
        <div className="quiet-exit-card">
          <span className="eyebrow">You are free to leave</span>
          <h1>{copy.heading}</h1>
          <p>{copy.body}</p>
          <Link className="secondary-button" href="/">
            {copy.linkLabel}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="personal-experience">
      <section className={`opening-scene ${started ? "opening-complete" : ""}`}>
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
        <div className="opening-content">
          <span className="eyebrow">{personalPageContent.opening.eyebrow}</span>
          <h1>{personalPageContent.opening.heading}</h1>
          <p>{personalPageContent.opening.body}</p>
          <p className="quiet-copy">
            {personalPageContent.opening.reassurance}
          </p>
          <div className="opening-actions">
            <button
              className="primary-button"
              type="button"
              onClick={openExperience}
            >
              {personalPageContent.opening.openLabel}
              <span aria-hidden="true">↓</span>
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => setQuietExit(true)}
            >
              {personalPageContent.opening.exitLabel}
            </button>
          </div>
        </div>
        <span className="opening-mark" aria-hidden="true">
          T / P
        </span>
      </section>

      {started ? (
        <>
          <div className="fixed-controls">
            <button type="button" onClick={openResponseHub}>
              Reply without watching everything
            </button>
            <button type="button" onClick={() => setQuietExit(true)}>
              Leave quietly
            </button>
          </div>

          <div className="story">
            <section className="story-intro" id="memories">
              <span className="eyebrow">
                {personalPageContent.memoriesIntro.eyebrow}
              </span>
              <h2>{personalPageContent.memoriesIntro.heading}</h2>
              <p>{personalPageContent.memoriesIntro.body}</p>
            </section>

            <section className="memory-sequence" aria-label="Remembered moments">
              {enabledMemories.slice(0, 5).map((memory, index) => (
                <article
                  className={`memory-scene ${
                    index % 2 === 1 ? "memory-scene-reverse" : ""
                  }`}
                  key={memory.id}
                >
                  <div className="memory-frame">
                    <MemoryMedia memory={memory} priority={index === 0} />
                    <span className="memory-number" aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="memory-caption">
                    <span className="eyebrow">{memory.category}</span>
                    <p>{memory.caption}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="absence-transition">
              <p>{personalPageContent.absenceTransition.first}</p>
              <strong>{personalPageContent.absenceTransition.second}</strong>
            </section>

            <section className="timer-section">
              <div className="section-heading centered-heading">
                <span className="eyebrow">July 5, 2026</span>
                <h2>{personalPageContent.separation.heading}</h2>
              </div>
              <SeparationTimer startDate={separationDate} />
              <div className="timer-copy">
                <p>{personalPageContent.separation.lineOne}</p>
                <small>{personalPageContent.separation.lineTwo}</small>
              </div>
            </section>

            <section className="reflection-section">
              <div className="reflection-photo">
                <MemoryMedia
                  memory={
                    enabledMemories.find(
                      (memory) => memory.type === "image",
                    ) ?? enabledMemories[0]
                  }
                />
              </div>
              <div className="section-copy">
                <span className="eyebrow">
                  {personalPageContent.reflection.eyebrow}
                </span>
                <h2>{personalPageContent.reflection.heading}</h2>
                <p>{personalPageContent.reflection.body}</p>
              </div>
            </section>

            <section className="accountability-section">
              <div className="section-copy wide-copy">
                <span className="eyebrow">
                  {personalPageContent.accountability.eyebrow}
                </span>
                <h2>{personalPageContent.accountability.heading}</h2>
                <p>{personalPageContent.accountability.body}</p>
                <p className="emphasis-copy">
                  {personalPageContent.accountability.request}
                </p>
              </div>
              <div className="accountability-points">
                {personalPageContent.accountability.points
                  .filter((point) => point.enabled)
                  .map((point, index) => (
                    <article key={point.title}>
                      <span aria-hidden="true">0{index + 1}</span>
                      <h3>{point.title}</h3>
                      <p>{point.body}</p>
                    </article>
                  ))}
              </div>
            </section>

            <section className="invitation-section">
              <span className="eyebrow">
                {personalPageContent.invitation.eyebrow}
              </span>
              <h2>{personalPageContent.invitation.heading}</h2>
              <p>{personalPageContent.invitation.body}</p>
              <ul>
                {personalPageContent.invitation.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>

            <section className="response-section" id="response">
              <div className="response-intro">
                <span className="eyebrow">
                  {personalPageContent.responseHub.eyebrow}
                </span>
                <h2>{personalPageContent.responseHub.heading}</h2>
                <p>{personalPageContent.invitation.final}</p>
                <small>{personalPageContent.responseHub.body}</small>
              </div>
              <p className="storage-notice">
                {personalPageContent.responseHub.privacyNote}
              </p>
              {!storageAvailable ? (
                <p className="storage-notice" role="status">
                  The private reply form is not connected yet. Your answers
                  cannot be stored until the database is configured.
                </p>
              ) : null}
              <ResponseHub token={token} contactLinks={contactLinks} />
            </section>

            <div className="story-signoff" aria-label="From Tushar">
              <span>— Tushar</span>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
