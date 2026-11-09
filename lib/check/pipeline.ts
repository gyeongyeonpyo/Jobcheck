import { createHash } from "node:crypto";
import { maskPersonalInfo } from "./mask.ts";
import { assembleItems, verifyQuotes } from "./rules.ts";
import { lookupBusinessStatus, lookupEmployerHistory, lookupWageBenchmark } from "./publicData.ts";
import type { CheckResponse, LlmExtraction } from "./types.ts";

export const MAX_INPUT_CHARS = 20_000;

export class NotJobPostingError extends Error {}

export type Extractor = (maskedPosting: string) => Promise<LlmExtraction>;

// 같은 공고는 이전 결과를 재사용한다. 원문 대신 해시만 키로 둔다.
// TODO: 서버리스 인스턴스 간 공유가 필요하면 KV 저장소로 옮긴다.
const cache = new Map<string, CheckResponse>();
const CACHE_LIMIT = 200;

export function postingHash(text: string): string {
  return createHash("sha256").update(text.replace(/\s+/g, " ").trim()).digest("hex");
}

export async function runCheck(rawPosting: string, extract: Extractor): Promise<CheckResponse> {
  const masked = maskPersonalInfo(rawPosting.trim());
  const key = postingHash(masked);
  const hit = cache.get(key);
  if (hit) return hit;

  let extraction: LlmExtraction | null = null;
  try {
    extraction = await extract(masked);
  } catch (err) {
    // AI 분류가 안 되면 AI 항목만 '확인 불가'로 두고 나머지는 계속한다
    console.warn("[check] extraction unavailable:", err instanceof Error ? err.message : err);
  }
  if (extraction && !extraction.is_job_posting) throw new NotJobPostingError();

  const { highlights, kept, dropped } = verifyQuotes(masked, extraction?.findings ?? []);
  const [business, wage, history] = await Promise.all([
    extraction?.employer.business_number
      ? lookupBusinessStatus(extraction.employer.business_number)
      : Promise.resolve(null),
    lookupWageBenchmark(),
    lookupEmployerHistory(),
  ]);

  const result: CheckResponse = {
    ok: true,
    postingText: masked,
    highlights,
    items: assembleItems({
      extraction,
      kept,
      business,
      wageBenchmarkReason: wage.reason,
      historyReason: history.reason,
    }),
    extracted: extraction
      ? { employer: extraction.employer, job: extraction.job, wage: extraction.wage }
      : null,
    droppedQuotes: dropped,
    aiAvailable: extraction !== null,
  };

  // AI가 정상 응답한 결과만 캐시한다 (일시 장애 결과를 고정하지 않기 위해)
  if (extraction) {
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
    cache.set(key, result);
  }
  return result;
}
