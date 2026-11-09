"use client";

import { useEffect, useRef, useState } from "react";
import StatusBadge, { type CheckStatus } from "./StatusBadge";

// 예시 리포트 — 가상 데이터임을 화면에 명시한다 (명세 10-5).
// 페이지에서 유일하게 스스로 움직이는 요소: 화면에 들어오면 항목이 차례로 확인되고 도장이 찍힌다.
const rows: { item: string; status: CheckStatus; note: string; source: string }[] = [
  {
    item: "구인자 실재",
    status: "확인됨",
    note: "사업자등록 상태 계속사업자, 상호·주소 일치",
    source: "국세청 사업자 상태 조회",
  },
  {
    item: "임금 수준",
    status: "확인 필요",
    note: "제시 일급이 유사 직종 통상 임금보다 크게 높음",
    source: "고용형태별근로실태조사 직종별 임금",
  },
  {
    item: "표현",
    status: "확인 필요",
    note: "“경력 무관 누구나 고수익 보장”: 현혹 우려 표현",
    source: "잡체크 검증 기준표",
  },
  {
    item: "법정 기준",
    status: "확인됨",
    note: "최저임금 미달, 차별 표현 없음",
    source: "최저임금법, 남녀고용평등법",
  },
  {
    item: "구인자 이력",
    status: "확인 불가",
    note: "조회 가능한 공개 이력 자료 없음",
    source: "고용노동부 명단공개",
  },
];

export default function ReportSpecimen() {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState<"idle" | "false" | "true">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) return; // 이미 보이는 상태면 그대로 둔다
    setPlay("false");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay("true");
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      data-play={play}
      className="report relative mt-12 rounded-card bg-paper p-5 shadow-lift ring-1 ring-line md:p-8"
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-dashed border-line pb-4">
        <span className="text-lg font-bold">확인사항 리포트</span>
        <span className="text-[15px] text-ink-soft">예시 리포트 (가상 데이터)</span>
      </figcaption>

      <div className="mt-4 rounded-small bg-mist px-4 py-3 text-[15px] leading-relaxed">
        <span className="font-semibold">대상 공고</span>
        <p className="mt-1 text-ink-soft">
          물류센터 단기 포장, 일급 35만 원.{" "}
          <mark className="rounded bg-caution-wash px-0.5 text-caution">경력 무관 누구나 고수익 보장</mark>
          . 당일 지급.
        </p>
      </div>

      <ol className="mt-2">
        {rows.map((r, i) => (
          <li
            key={r.item}
            style={{ "--i": i } as React.CSSProperties}
            className="report-row grid gap-x-4 gap-y-1.5 border-b border-line py-4 last:border-b-0 sm:grid-cols-[112px_1fr_auto] sm:items-start"
          >
            <span className="font-semibold">{r.item}</span>
            <span className="text-[15px] leading-relaxed">
              {r.note}
              <span className="mt-0.5 block text-[14px] text-ink-soft">근거: {r.source}</span>
            </span>
            <span className="sm:justify-self-end">
              <StatusBadge status={r.status} />
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-4 pr-[104px] text-[14px] text-ink-soft md:pr-[128px]">
        잡체크 리포트는 공고의 확인사항과 근거를 제공하며, 위법 여부를 판정하지 않습니다.
      </p>

      {/* 도장: 리포트 맨 아래 오른쪽, 고지 문구 옆 여백에 찍힌다 */}
      <div
        aria-hidden="true"
        className="report-stamp pointer-events-none absolute bottom-4 right-4 grid size-[88px] rotate-[-8deg] place-items-center rounded-full border-[3px] border-signal bg-paper/80 text-center text-[13px] font-bold leading-tight text-signal md:bottom-6 md:right-8 md:size-[100px]"
      >
        <span>
          검토 기록
          <br />
          보관
        </span>
      </div>
    </figure>
  );
}
