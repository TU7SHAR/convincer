"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { MemoryItem } from "@/src/content/personal-page";

type MemoryMediaProps = {
  memory: MemoryItem;
  priority?: boolean;
};

export function MemoryMedia({ memory, priority = false }: MemoryMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || memory.type !== "video") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    // Try playing immediately on mount — handles cases where autoPlay
    // attribute is ignored by the browser on conditional renders.
    void video.play().catch(() => undefined);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.paused) void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      // threshold: 0 fires as soon as a single pixel is visible.
      // Necessary for tall portrait videos on small mobile screens
      // where the full 25% threshold is never reached.
      { threshold: 0 },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [memory.type]);

  if (failed) {
    return (
      <div className="memory-fallback" role="img" aria-label={memory.alt}>
        <span>A quiet moment belongs here.</span>
      </div>
    );
  }

  if (memory.type === "image") {
    return (
      <Image
        src={memory.src}
        alt={memory.alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 88vw, 520px"
        className="memory-image"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="memory-video"
      muted
      autoPlay
      playsInline
      loop
      preload="auto"
      poster={memory.poster}
      aria-label={memory.alt}
      onError={() => setFailed(true)}
    >
      <source src={memory.src} type="video/mp4" />
      Your browser does not support this video.
    </video>
  );
}
