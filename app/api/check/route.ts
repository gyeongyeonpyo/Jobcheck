import { NextResponse } from "next/server";
import { z } from "zod";
import { extractWithClaude, llmConfigured } from "@/lib/check/llm.ts";
import { FetchPostingError, fetchPostingText } from "@/lib/check/fetchPosting.ts";
import { MAX_INPUT_CHARS, NotJobPostingError, runCheck } from "@/lib/check/pipeline.ts";
import { rateLimit } from "@/lib/check/rateLimit.ts";
import type { CheckError } from "@/lib/check/types.ts";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("text"), text: z.string() }),
  z.object({ mode: z.literal("url"), url: z.string() }),
]);

function fail(status: number, code: CheckError["code"], message: string, headers?: HeadersInit) {
  return NextResponse.json<CheckError>({ ok: false, code, message }, { status, headers });
}

export async function POST(req: Request) {
  if (!llmConfigured()) {
    return fail(503, "not_configured", "공고 확인 기능을 준비하고 있습니다. 베타 오픈 후 이용할 수 있습니다.");
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return fail(
      429,
      "rate_limited",
      `요청이 많습니다. ${Math.ceil(limit.retryAfterSec / 60)}분 뒤에 다시 시도해 주세요.`,
      { "retry-after": String(limit.retryAfterSec) },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, "invalid_input", "공고 URL이나 내용을 입력해 주세요.");

  let posting: string;
  if (parsed.data.mode === "url") {
    try {
      posting = await fetchPostingText(parsed.data.url.trim());
    } catch (err) {
      if (err instanceof FetchPostingError) {
        return fail(
          err.code === "blocked_url" ? 400 : 422,
          err.code,
          `${err.message} 공고 내용을 복사해 '텍스트 붙여넣기'로 확인해 주세요.`,
        );
      }
      throw err;
    }
  } else {
    posting = parsed.data.text;
  }

  posting = posting.trim();
  if (posting.length < 20) return fail(400, "invalid_input", "공고 내용이 너무 짧습니다. 공고 전체를 붙여넣어 주세요.");
  if (posting.length > MAX_INPUT_CHARS) {
    return fail(
      413,
      "too_long",
      `공고가 너무 깁니다 (${posting.length.toLocaleString("ko-KR")}자). ${MAX_INPUT_CHARS.toLocaleString("ko-KR")}자 이내로 줄여 주세요.`,
    );
  }

  try {
    const result = await runCheck(posting, extractWithClaude);
    // 원문은 저장하지 않는다. 응답에는 마스킹된 본문만 담는다.
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    if (err instanceof NotJobPostingError) {
      return fail(422, "not_job_posting", "구인광고로 보이지 않습니다. 채용 공고 내용을 넣어 주세요.");
    }
    throw err;
  }
}
