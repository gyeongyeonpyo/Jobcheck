import { roadmap } from "@/lib/content";

type Phase = "done" | "now" | "next";

function phaseOf(start: string, end: string, today: string): Phase {
  if (today > end) return "done";
  if (today >= start) return "now";
  return "next";
}

function fmt(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}.${Number(m)}.${Number(d)}.`;
}

// 지난 단계는 흐리게, 진행 중인 단계는 진하게 (Little Plains의 오래된 글 흐림 처리 응용)
// 서버 렌더 시점 기준. 페이지는 1시간마다 다시 생성된다.
export default function Roadmap() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

  return (
    <ol className="relative border-l-2 border-line pl-6 md:pl-8">
      {roadmap.map((r) => {
        const phase = phaseOf(r.start, r.end, today);
        return (
          <li key={r.title} className={`relative pb-8 last:pb-0 ${phase === "done" ? "opacity-55" : ""}`}>
            <span
              aria-hidden="true"
              className={`absolute top-1.5 -left-[33px] size-4 rounded-full border-2 md:-left-[41px] ${
                phase === "now"
                  ? "border-signal bg-signal"
                  : phase === "done"
                    ? "border-ink bg-ink"
                    : "border-ink-soft bg-paper"
              }`}
            />
            <p className="tnum text-[15px] text-ink-soft">
              {fmt(r.start)} ~ {fmt(r.end)}
              {phase === "now" ? (
                <span className="ml-2 rounded-full bg-signal px-2 py-0.5 text-[13px] font-semibold text-white">
                  진행 중
                </span>
              ) : null}
              {phase === "done" ? <span className="sr-only"> (완료된 기간)</span> : null}
            </p>
            <p className={`mt-1 font-bold ${phase === "now" ? "text-lg" : ""}`}>{r.title}</p>
            <p className="text-[15px] text-ink-soft">{r.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}
