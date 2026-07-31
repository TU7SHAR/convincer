"use client";

import { useState } from "react";

import { personalPageContent } from "@/src/content/personal-page";

const HEART_STICKERS = ["♥", "♡", "♥", "✦", "♡", "♥", "♡", "♥"];

export function SmileScene() {
  const [burst, setBurst] = useState(0);
  const copy = personalPageContent.smileScene;

  return (
    <section
      className="smile-scene"
      data-visit-section="smile"
      aria-labelledby="smile-scene-heading"
    >
      {burst > 0 ? (
        <div
          className="heart-sticker-field"
          key={burst}
          aria-hidden="true"
        >
          {HEART_STICKERS.map((sticker, index) => (
            <span className="heart-sticker" key={`${sticker}-${index}`}>
              {sticker}
            </span>
          ))}
        </div>
      ) : null}

      <div className="smile-scene-content">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2 id="smile-scene-heading">{copy.heading}</h2>
        <p>{copy.body}</p>
        <small>{copy.note}</small>
        <button
          className="smile-button"
          type="button"
          onClick={() => setBurst((current) => current + 1)}
        >
          <span aria-hidden="true">♡</span>
          {burst > 0 ? copy.clickedLabel : copy.buttonLabel}
        </button>
      </div>
    </section>
  );
}
