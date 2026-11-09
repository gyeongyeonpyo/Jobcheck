"use client";

import { useEffect, useState } from "react";
import { ENFORCEMENT_DATE } from "@/lib/content";

// 한국 시간 기준 오늘 날짜(YYYY-MM-DD)
function todayKST(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(now);
}

export function daysUntil(target: string, today: string): number {
  const t = Date.parse(`${target}T00:00:00Z`);
  const d = Date.parse(`${today}T00:00:00Z`);
  return Math.round((t - d) / 86_400_000);
}

export default function Countdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(ENFORCEMENT_DATE, todayKST(new Date())));
  }, []);

  let status = "";
  if (days !== null) {
    if (days > 0) status = `D-${days}`;
    else if (days === 0) status = "오늘 시행";
    else status = "시행 중";
  }

  return (
    <div className="border-y border-line bg-paper">
      <p className="mx-auto flex max-w-[1280px] flex-wrap items-baseline justify-center gap-x-4 gap-y-1 px-4 py-4 text-center text-[15px] md:text-base">
        <span className="font-semibold">개정 직업안정법 시행</span>
        <span className="tnum min-w-[4.5ch] font-bold text-signal" aria-live="polite">
          {status}
        </span>
        <span className="tnum text-ink-soft">2026.12.10.</span>
      </p>
    </div>
  );
}
