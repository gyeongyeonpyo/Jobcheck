"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { checkNotices } from "@/lib/content";
import type { CheckError, CheckResponse, Highlight } from "@/lib/check/types";

type Mode = "url" | "text";
type Stage = 0 | 1 | 2 | 3; // 0 대기, 1 공고 읽기, 2 공공자료 대조, 3 결과 정리

const stages = ["공고 읽기", "공공자료 대조", "결과 정리"];

function PostingWithHighlights({ text, highlights }: { text: string; highlights: Highlight[] }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  highlights.forEach((h, i) => {
    if (h.start > cursor) parts.push(text.slice(cursor, h.start));
    parts.push(
      <mark key={i} className="rounded bg-caution-wash px-0.5 text-caution">
        {text.slice(h.start, h.end)}
        <sup className="ml-0.5 font-bold">{i + 1}</sup>
      </mark>,
    );
    cursor = h.end;
  });
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export default function CheckClient({ enabled }: { enabled: boolean }) {
  const [mode, setMode] = useState<Mode>("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [stage, setStage] = useState<Stage>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const noticeId = useId();

  // 결과가 그려진 뒤 제목으로 포커스를 옮겨 화면낭독기·키보드 사용자에게 결과를 알린다
  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setStage(1);
    // 단계 표시는 대략적인 진행 안내다 (서버 처리 단계와 정확히 일치하지 않음)
    const t1 = setTimeout(() => setStage(2), 6000);
    const t2 = setTimeout(() => setStage(3), 14000);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(mode === "url" ? { mode, url } : { mode, text }),
      });
      const data = (await res.json().catch(() => null)) as CheckResponse | CheckError | null;
      if (!data) throw new Error("응답을 읽지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
      if (!data.ok) {
        setError(data.message);
        if (data.code === "fetch_failed" || data.code === "blocked_url") setMode("text");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "확인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setStage(0);
    }
  }

  if (!enabled) {
    return (
      <div className="mt-10 rounded-card bg-mist p-6 md:p-8">
        <p className="font-bold">공고 확인 기능은 오픈 예정입니다.</p>
        <p className="mt-2 text-ink-soft">
          베타 오픈(2026년 12월 9일 목표)에 맞춰 열 예정입니다. 사업자라면 지금 검증 의뢰를 남길 수 있습니다.
        </p>
        <Link href="/verify" className="mt-5 inline-block font-semibold text-signal underline underline-offset-4">
          사업자 검증 의뢰하기
        </Link>
      </div>
    );
  }

  const busy = stage > 0;

  return (
    <>
      <form onSubmit={onSubmit} className="mt-10" aria-describedby={noticeId}>
        <div role="group" aria-label="입력 방식" className="inline-flex rounded-full bg-mist p-1">
          {(
            [
              ["text", "텍스트 붙여넣기"],
              ["url", "공고 URL"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-2 text-[15px] font-semibold ${
                mode === m ? "bg-paper text-ink shadow-soft" : "text-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {mode === "url" ? (
            <>
              <label htmlFor="posting-url" className="sr-only">
                공고 URL
              </label>
              <input
                id="posting-url"
                type="url"
                inputMode="url"
                required
                placeholder="https://"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-small border border-line bg-paper px-4 py-3.5 text-base outline-none focus:border-signal"
              />
              <p className="mt-2 text-[14px] text-ink-soft">
                로그인이 필요한 채용 사이트는 가져오지 못할 수 있습니다. 그럴 때는 공고 내용을 복사해 붙여넣어 주세요.
              </p>
            </>
          ) : (
            <>
              <label htmlFor="posting-text" className="sr-only">
                공고 내용
              </label>
              <textarea
                id="posting-text"
                required
                minLength={20}
                maxLength={20000}
                rows={10}
                placeholder="공고 제목, 회사명, 업무 내용, 임금, 근무시간 등을 그대로 붙여넣어 주세요."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full resize-y rounded-small border border-line bg-paper px-4 py-3.5 text-base leading-relaxed outline-none focus:border-signal"
              />
            </>
          )}
        </div>

        <p id={noticeId} className="mt-3 rounded-small bg-mist px-4 py-3 text-[14px] leading-relaxed">
          {checkNotices.beforeSend}
        </p>

        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 font-semibold text-white transition-colors hover:bg-signal disabled:cursor-progress disabled:opacity-70 sm:w-auto"
        >
          {busy ? "확인하는 중" : "공고 확인하기"}
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {busy ? (
          <ol className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {stages.map((s, i) => {
              const n = (i + 1) as Stage;
              const state = stage > n ? "done" : stage === n ? "now" : "next";
              return (
                <li
                  key={s}
                  className={
                    state === "now" ? "font-bold text-ink" : state === "done" ? "text-ink" : "text-ink-soft"
                  }
                >
                  {state === "done" ? "✓ " : ""}
                  {s}
                  {state === "now" ? " 중" : ""}
                </li>
              );
            })}
          </ol>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-small bg-caution-wash px-4 py-3 font-medium text-caution">
            {error}
          </p>
        ) : null}
      </div>

      {result ? (
        <section aria-labelledby="result-title" className="mt-12">
          <h2 id="result-title" ref={resultRef} tabIndex={-1} className="text-[22px] font-bold md:text-[26px]">
            확인 결과
          </h2>
          {!result.aiAvailable ? (
            <p className="mt-3 rounded-small bg-unknown-wash px-4 py-3 text-[15px]">
              AI 분류를 받지 못해 표현 관련 항목은 확인 불가로 표시했습니다. 잠시 뒤 다시 시도해 주세요.
            </p>
          ) : null}

          <ul className="mt-6 rounded-card ring-1 ring-line">
            {result.items.map((it) => (
              <li
                key={it.item}
                className="grid gap-x-4 gap-y-1.5 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[112px_1fr_auto] sm:items-start"
              >
                <span className="font-semibold">{it.item}</span>
                <span className="text-[15px] leading-relaxed">
                  {it.note}
                  <span className="mt-0.5 block text-[14px] text-ink-soft">
                    근거: {it.source} ({it.basis})
                  </span>
                </span>
                <span className="sm:justify-self-end">
                  <StatusBadge status={it.status} />
                </span>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 font-bold">공고 원문 (연락처는 가림)</h3>
          <div className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-small bg-mist p-4 text-[15px] leading-relaxed">
            <PostingWithHighlights text={result.postingText} highlights={result.highlights} />
          </div>
          {result.highlights.length > 0 ? (
            <ol className="mt-4 space-y-2 text-[15px]">
              {result.highlights.map((h, i) => (
                <li key={i} className="grid grid-cols-[24px_1fr] gap-2">
                  <span className="tnum font-bold text-caution">{i + 1}</span>
                  <span>
                    <span className="font-semibold">{h.category}</span>: {h.reason}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-8 space-y-1 border-t border-line pt-5 text-[14px] text-ink-soft">
            <p>{checkNotices.notLegal}</p>
            <p>{checkNotices.aiOnly}</p>
          </div>
          <p className="mt-6 text-[15px]">
            사업자이신가요?{" "}
            <Link href="/verify" className="font-semibold text-signal underline underline-offset-4">
              정식 검증 의뢰
            </Link>
          </p>
        </section>
      ) : null}
    </>
  );
}
