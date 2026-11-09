"use client";

import { useState } from "react";
import { correctionDraft as d } from "@/lib/content";

// 수정 요청 문안 예시 (가상 데이터). 구인자에게 보낼 메일·메시지 형태로 보여 주고, 복사할 수 있게 한다.
export function draftAsText(): string {
  return [
    `제목: ${d.subject}`,
    "",
    d.greeting,
    d.intro,
    "",
    ...d.items.map((it, i) => `${i + 1}. ${it.item}\n${it.request}`),
    "",
    ...d.closing,
  ].join("\n");
}

export default function CorrectionDraft() {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(draftAsText());
      setCopied("done");
    } catch {
      setCopied("failed");
    }
  }

  return (
    <figure className="rounded-card bg-paper p-5 shadow-lift ring-1 ring-line md:p-8">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-dashed border-line pb-4">
        <span className="text-lg font-bold">수정 요청 문안</span>
        <span className="text-[15px] text-ink-soft">예시 문안 (가상 데이터)</span>
      </figcaption>

      <dl className="mt-4 grid grid-cols-[72px_1fr] gap-x-3 gap-y-1.5 text-[15px]">
        <dt className="text-ink-soft">받는 사람</dt>
        <dd>{d.to}</dd>
        <dt className="text-ink-soft">제목</dt>
        <dd className="font-semibold">{d.subject}</dd>
      </dl>

      <div className="mt-5 space-y-4 rounded-small bg-mist p-4 text-[15px] leading-relaxed md:p-5">
        <p>
          <span className="block">{d.greeting}</span>
          <span className="block">{d.intro}</span>
        </p>
        <ol className="space-y-3">
          {d.items.map((it, i) => (
            <li key={it.item}>
              <p className="font-semibold">
                {i + 1}. {it.item}
              </p>
              <p>{it.request}</p>
            </li>
          ))}
        </ol>
        <p>
          {d.closing.map((c) => (
            <span key={c} className="block">
              {c}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[15px] font-semibold text-ink ring-1 ring-line ring-inset transition-colors hover:bg-mist"
        >
          문안 복사하기
        </button>
        <span role="status" className="text-[14px] text-ink-soft">
          {copied === "done" ? "복사했습니다. 메일이나 메시지에 붙여넣어 보내세요." : null}
          {copied === "failed" ? "복사하지 못했습니다. 문안을 직접 선택해 복사해 주세요." : null}
        </span>
      </div>

      <p className="mt-4 text-[14px] text-ink-soft">
        실제 문안은 공고와 확인 결과에 맞춰 작성되며, 보내기 전에 내용을 확인하고 고쳐 쓸 수 있습니다.
      </p>
    </figure>
  );
}
