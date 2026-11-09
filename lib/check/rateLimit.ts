// 무료 기능 남용 방지: IP별 요청 수 제한.
// 인스턴스 메모리 기준이라 서버리스에서는 인스턴스마다 따로 센다.
// TODO: 공개 전 KV 저장소(Upstash 등) 기반 제한 + 봇 확인(캡차) 추가 (명세 10-2)
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 10;
const hits = new Map<string, number[]>();

export function rateLimit(ip: string, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return { ok: true, retryAfterSec: 0 };
}
