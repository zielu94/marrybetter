"use client";

import { useState, useEffect } from "react";

interface WeddingCountdownProps {
  weddingDate: Date;
}

export default function WeddingCountdown({ weddingDate }: WeddingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const target = new Date(weddingDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isPast: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  if (timeLeft.isPast) {
    return (
      <section className="py-12 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-xl mx-auto text-center px-6">
          <p className="text-lg text-zinc-700 dark:text-zinc-300 font-medium">
            🎉 Der große Tag ist da!
          </p>
        </div>
      </section>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Tage" },
    { value: timeLeft.hours, label: "Stunden" },
    { value: timeLeft.minutes, label: "Minuten" },
    { value: timeLeft.seconds, label: "Sekunden" },
  ];

  return (
    <section className="py-12 sm:py-16 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-8">
          Noch
        </p>
        <div className="grid grid-cols-4 gap-3 sm:gap-6">
          {units.map((unit) => (
            <div key={unit.label} className="text-center">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700/50 py-4 sm:py-6 px-2">
                <div className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight tabular-nums">
                  {String(unit.value).padStart(2, "0")}
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-2 uppercase tracking-wider">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
