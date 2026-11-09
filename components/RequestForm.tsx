"use client";

import { useState } from "react";
import { forms, type RequestKind } from "@/lib/requests";
import { CONTACT_EMAIL } from "@/lib/content";

// 메일 앱 주소창 길이 제한을 넘지 않도록 긴 입력은 줄인다
const MAX_FIELD_IN_MAIL = 1200;

function buildMailto(kind: RequestKind, values: Record<string, string>): { href: string; truncated: boolean } {
  const def = forms[kind];
  let truncated = false;
  const lines = def.fields
    .filter((f) => values[f.name])
    .map((f) => {
      let v = values[f.name];
      if (v.length > MAX_FIELD_IN_MAIL) {
        v = `${v.slice(0, MAX_FIELD_IN_MAIL)} …(이하 생략, 메일에 이어서 붙여 주세요)`;
        truncated = true;
      }
      return `${f.label}: ${v}`;
    });
  const who = values.company || values.org || values.email || "";
  const subject = `[잡체크] ${def.title}${who ? ` - ${who}` : ""}`;
  const body = [...lines, "", "위 내용으로 신청합니다. (필수 동의 항목에 동의함)"].join("\n");
  return {
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    truncated,
  };
}

const inputClass =
  "w-full rounded-small border border-line bg-paper px-4 py-3 text-base outline-none focus:border-signal";

export default function RequestForm({ kind }: { kind: RequestKind }) {
  const def = forms[kind];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ receipt: string; message: string } | null>(null);
  const [mailFallback, setMailFallback] = useState<{ href: string; truncated: boolean } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMailFallback(null);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    const values: Record<string, string> = {};
    for (const f of def.fields) body[f.name] = values[f.name] = String(fd.get(f.name) ?? "").trim();
    body.consents = def.consents.map((_, i) => fd.get(`consent-${i}`) === "on");
    try {
      const res = await fetch(`/api/requests/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; receipt: string; message: string }
        | { ok: false; code?: string; message: string }
        | null;
      if (!data) setError("응답을 읽지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
      else if (!data.ok && data.code === "not_configured") setMailFallback(buildMailto(kind, values));
      else if (!data.ok) setError(data.message);
      else setDone({ receipt: data.receipt, message: data.message });
    } catch {
      setError("전송하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="mt-10 rounded-card bg-ok-wash p-6 md:p-8">
        <p className="text-lg font-bold text-ok">{done.message}</p>
        <p className="mt-2">
          접수번호 <span className="tnum font-bold">{done.receipt}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate={false}>
      {def.fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="block text-[15px] font-semibold">
            {f.label}
            {f.required ? <span className="ml-1 text-caution">(필수)</span> : null}
          </label>
          {f.hint ? <p className="text-[14px] text-ink-soft">{f.hint}</p> : null}
          <div className="mt-2">
            {f.type === "textarea" ? (
              <textarea id={f.name} name={f.name} required={f.required} rows={5} className={inputClass} />
            ) : f.type === "select" ? (
              <select id={f.name} name={f.name} required={f.required} defaultValue="" className={inputClass}>
                <option value="" disabled>
                  선택해 주세요
                </option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                min={f.type === "number" ? 0 : undefined}
                required={f.required}
                autoComplete={f.autoComplete}
                className={inputClass}
              />
            )}
          </div>
        </div>
      ))}

      <fieldset className="space-y-3 rounded-small bg-mist p-4">
        <legend className="sr-only">동의</legend>
        {def.consents.map((c, i) => (
          <label key={c} className="flex gap-3 text-[15px] leading-relaxed">
            <input type="checkbox" name={`consent-${i}`} required className="mt-1.5 size-4 shrink-0 accent-ink" />
            <span>
              {c} <span className="text-caution">(필수)</span>
            </span>
          </label>
        ))}
      </fieldset>

      {mailFallback ? (
        <div role="status" className="rounded-small bg-signal-wash p-4 text-[15px] leading-relaxed md:p-5">
          <p className="font-semibold">지금은 온라인 접수 대신 이메일로 받고 있습니다.</p>
          <p className="mt-1">
            아래 버튼을 누르면 입력하신 내용이 담긴 메일 작성 창이 열립니다. 보내기를 눌러야 접수됩니다.
          </p>
          {mailFallback.truncated ? (
            <p className="mt-1 text-caution">긴 내용은 일부만 담겼습니다. 메일에 나머지를 이어서 붙여 주세요.</p>
          ) : null}
          <a
            href={mailFallback.href}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-signal"
          >
            메일로 보내기
          </a>
          <p className="mt-3 text-[14px] text-ink-soft">
            메일 창이 열리지 않으면 {CONTACT_EMAIL} 로 직접 보내 주세요.
          </p>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-small bg-caution-wash px-4 py-3 font-medium text-caution">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 font-semibold text-white transition-colors hover:bg-signal disabled:opacity-70 sm:w-auto"
      >
        {busy ? "보내는 중" : def.submit}
      </button>
    </form>
  );
}
