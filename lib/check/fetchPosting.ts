import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// 공고 URL을 서버에서 가져온다. 내부망·사설 IP 요청을 막는다 (SSRF 방지).
const MAX_BYTES = 1_000_000;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

export class FetchPostingError extends Error {
  code: "blocked_url" | "fetch_failed";
  constructor(code: "blocked_url" | "fetch_failed", message: string) {
    super(message);
    this.code = code;
  }
}

export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchPostingError("blocked_url", "URL 형식이 올바르지 않습니다.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:")
    throw new FetchPostingError("blocked_url", "http 또는 https 주소만 확인할 수 있습니다.");
  if (url.port && url.port !== "80" && url.port !== "443")
    throw new FetchPostingError("blocked_url", "기본 포트(80, 443)의 주소만 확인할 수 있습니다.");
  if (url.username || url.password)
    throw new FetchPostingError("blocked_url", "계정 정보가 포함된 주소는 확인할 수 없습니다.");

  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (addrs.length === 0) throw new FetchPostingError("fetch_failed", "주소를 찾을 수 없습니다.");
  if (addrs.some((a) => isPrivateAddress(a.address)))
    throw new FetchPostingError("blocked_url", "내부망 주소는 확인할 수 없습니다.");
  return url;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|dd|dt)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchPostingText(raw: string): Promise<string> {
  let url = await assertPublicUrl(raw);
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "user-agent": "JobcheckBot/0.1 (+job posting check)", accept: "text/html,text/plain" },
      });
    } catch {
      throw new FetchPostingError("fetch_failed", "공고 페이지를 불러오지 못했습니다.");
    }
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) break;
      url = await assertPublicUrl(new URL(next, url).toString()); // 리다이렉트도 매번 다시 검사
      continue;
    }
    if (!res.ok) throw new FetchPostingError("fetch_failed", `공고 페이지가 응답하지 않습니다 (${res.status}).`);
    const type = res.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/.test(type))
      throw new FetchPostingError("fetch_failed", "웹페이지 형식의 공고만 가져올 수 있습니다.");

    const reader = res.body?.getReader();
    if (!reader) throw new FetchPostingError("fetch_failed", "공고 페이지가 비어 있습니다.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const body = new TextDecoder().decode(Buffer.concat(chunks));
    const text = type.includes("text/plain") ? body : htmlToText(body);
    if (text.length < 40)
      throw new FetchPostingError(
        "fetch_failed",
        "페이지에서 공고 내용을 찾지 못했습니다. 로그인이 필요한 사이트일 수 있습니다.",
      );
    return text;
  }
  throw new FetchPostingError("fetch_failed", "리다이렉트가 너무 많습니다.");
}
