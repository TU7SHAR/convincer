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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !prefersReducedMotion) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.55 },
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
      playsInline
      loop
      preload="metadata"
      poster={memory.poster}
      aria-label={memory.alt}
      onError={() => setFailed(true)}
    >
      <source src={memory.src} type="video/mp4" />
      Your browser does not support this video.
    </video>
  );
}
