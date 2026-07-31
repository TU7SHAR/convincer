"use client";

import { useEffect, useState } from "react";

type TimerValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimer(startDate: string): TimerValue {
  const start = new Date(startDate).getTime();
  const difference = Math.max(0, Date.now() - start);

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function SeparationTimer({ startDate }: { startDate: string }) {
  const [timer, setTimer] = useState<TimerValue | null>(null);

  useEffect(() => {
    const update = () => setTimer(calculateTimer(startDate));
    update();

    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [startDate]);

  const units = [
    ["Days", timer?.days],
    ["Hours", timer?.hours],
    ["Minutes", timer?.minutes],
    ["Seconds", timer?.seconds],
  ] as const;

  return (
    <div className="timer-grid" aria-live="off" aria-label="Time since July 5">
      {units.map(([label, value]) => (
        <div className="timer-unit" key={label}>
          <span className="timer-value">
            {value === undefined ? "—" : String(value).padStart(2, "0")}
          </span>
          <span className="timer-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
