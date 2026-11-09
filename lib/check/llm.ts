import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { LlmExtractionSchema, type LlmExtraction } from "./types.ts";
import { SYSTEM_PROMPT, userMessage } from "./prompt.ts";

export const MODEL = "claude-opus-5-5";

type UnavailableReason = "refusal" | "parse_failed" | "api_error" | "not_configured";

export class LlmUnavailableError extends Error {
  reason: UnavailableReason;
  constructor(reason: UnavailableReason, message: string) {
    super(message);
    this.reason = reason;
  }
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  // 서버 전용. ANTHROPIC_API_KEY는 Vercel 환경변수에만 둔다.
  client ??= new Anthropic({ timeout: 60_000, maxRetries: 2 });
  return client;
}

export function llmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function extractWithClaude(maskedPosting: string): Promise<LlmExtraction> {
  if (!llmConfigured()) throw new LlmUnavailableError("not_configured", "ANTHROPIC_API_KEY가 없습니다.");

  let response;
  try {
    response = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      // 거부되면 서버에서 대체 모델로 다시 시도한다
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // 추출·분류 작업이라 low. 평가 세트로 품질을 확인한 뒤 조정한다 (명세 14 TODO).
      output_config: { effort: "low", format: betaZodOutputFormat(LlmExtractionSchema) },
      // 고정된 시스템 프롬프트 + 기준표를 캐시한다. 공고 본문은 그 뒤에 온다.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMessage(maskedPosting) }],
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error("[check] Claude API error", err.status, err.message);
      throw new LlmUnavailableError("api_error", "AI 분류 서비스에 연결하지 못했습니다.");
    }
    throw err;
  }

  if (response.stop_reason === "refusal") {
    throw new LlmUnavailableError("refusal", "AI가 이 공고의 분류를 거절했습니다.");
  }
  const parsed = response.parsed_output;
  if (!parsed) throw new LlmUnavailableError("parse_failed", "AI 응답을 해석하지 못했습니다.");

  const u = response.usage;
  console.info(
    `[check] model=${response.model} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens}`,
  );
  return parsed;
}
