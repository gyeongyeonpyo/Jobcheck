import type { CheckItemResult, Highlight, LlmExtraction } from "./types.ts";
import type { BusinessStatus } from "./publicData.ts";

// 2026년 적용 최저임금 (시간급). 최저임금위원회 결정, 고용노동부 고시.
// TODO: 2027년 적용 최저임금 고시(2026년 8월) 반영 및 연도별 적용 로직 추가
export const MINIMUM_WAGE_2026 = 10_320;
// 주 40시간 근무 시 월 환산 기준시간 (주휴 포함)
const MONTHLY_STANDARD_HOURS = 209;

function normalize(s: string): { text: string; map: number[] } {
  // 공백 차이만 무시하고 원문 위치를 되찾을 수 있게 인덱스 표를 만든다
  const map: number[] = [];
  let text = "";
  let prevSpace = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const isSpace = /\s/.test(ch);
    if (isSpace) {
      if (prevSpace) continue;
      text += " ";
    } else {
      text += ch;
    }
    map.push(i);
    prevSpace = isSpace;
  }
  return { text, map };
}

// AI가 인용한 구절이 원문에 실제로 있는지 확인한다. 없으면 버린다 (지어낸 지적 차단).
export function verifyQuotes(
  posting: string,
  findings: LlmExtraction["findings"],
): { highlights: Highlight[]; kept: LlmExtraction["findings"]; dropped: number } {
  const hay = normalize(posting);
  const highlights: Highlight[] = [];
  const kept: LlmExtraction["findings"] = [];
  let dropped = 0;
  for (const f of findings) {
    const needle = normalize(f.quote.trim()).text;
    const at = needle.length >= 2 ? hay.text.indexOf(needle) : -1;
    if (at < 0) {
      dropped++;
      continue;
    }
    const start = hay.map[at];
    const end = hay.map[at + needle.length - 1] + 1;
    highlights.push({ start, end, category: f.category, reason: f.reason });
    kept.push(f);
  }
  highlights.sort((a, b) => a.start - b.start);
  // 겹치는 강조는 앞의 것만 남긴다
  const merged: Highlight[] = [];
  for (const h of highlights) {
    const last = merged[merged.length - 1];
    if (last && h.start < last.end) continue;
    merged.push(h);
  }
  return { highlights: merged, kept, dropped };
}

// 시간급 환산. 공고 정보만으로 계산할 수 없으면 null.
export function hourlyWage(w: LlmExtraction["wage"]): number | null {
  if (w.amount_won == null || w.amount_won <= 0) return null;
  switch (w.unit) {
    case "시급":
      return w.amount_won;
    case "일급":
      return w.daily_hours && w.daily_hours > 0 ? w.amount_won / w.daily_hours : null;
    case "주급":
      return w.weekly_hours && w.weekly_hours > 0 ? w.amount_won / w.weekly_hours : null;
    case "월급":
      // 주 40시간 근무가 명시된 경우만 209시간으로 환산한다
      return w.weekly_hours === 40 ? w.amount_won / MONTHLY_STANDARD_HOURS : null;
    case "연봉":
      return w.weekly_hours === 40 ? w.amount_won / 12 / MONTHLY_STANDARD_HOURS : null;
    default:
      return null;
  }
}

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export function assembleItems(input: {
  extraction: LlmExtraction | null;
  kept: LlmExtraction["findings"];
  business: BusinessStatus | null;
  wageBenchmarkReason: string;
  historyReason: string;
}): CheckItemResult[] {
  const { extraction, kept, business } = input;
  const items: CheckItemResult[] = [];

  // 1. 구인자 실재 — 공공데이터
  if (!extraction) {
    items.push({
      item: "구인자 실재",
      status: "확인 불가",
      note: "공고 정보를 추출하지 못해 확인할 수 없습니다.",
      source: "국세청 사업자 상태 조회",
      basis: "공공데이터",
    });
  } else if (!extraction.employer.business_number) {
    items.push({
      item: "구인자 실재",
      status: "확인 불가",
      note: extraction.employer.name
        ? `공고에 사업자등록번호가 없어 '${extraction.employer.name}'의 등록 상태를 조회할 수 없습니다.`
        : "공고에 상호와 사업자등록번호가 없어 조회할 수 없습니다.",
      source: "국세청 사업자 상태 조회",
      basis: "공공데이터",
    });
  } else if (!business || business.kind === "unavailable") {
    items.push({
      item: "구인자 실재",
      status: "확인 불가",
      note: business?.kind === "unavailable" ? `${business.reason}입니다.` : "조회하지 못했습니다.",
      source: "국세청 사업자 상태 조회",
      basis: "연동 예정",
    });
  } else if (business.kind === "active") {
    items.push({
      item: "구인자 실재",
      status: "확인됨",
      note: "공고의 사업자등록번호가 계속사업자로 조회됩니다. 상호·주소 일치 여부는 직접 확인해 주세요.",
      source: "국세청 사업자 상태 조회",
      basis: "공공데이터",
    });
  } else {
    items.push({
      item: "구인자 실재",
      status: "확인 필요",
      note:
        business.kind === "not_registered"
          ? "공고의 사업자등록번호가 국세청에 등록되지 않은 번호로 조회됩니다."
          : `공고의 사업자등록번호가 '${business.label}'로 조회됩니다.`,
      source: "국세청 사업자 상태 조회",
      basis: "공공데이터",
    });
  }

  // 2. 임금 수준 — 통계표 대조 (연동 예정)
  items.push({
    item: "임금 수준",
    status: "확인 불가",
    note: `${input.wageBenchmarkReason}입니다.${
      extraction?.wage.raw ? ` 공고의 임금 표기: "${extraction.wage.raw}"` : ""
    }`,
    source: "고용형태별근로실태조사 직종별 임금",
    basis: "연동 예정",
  });

  // 3. 표현 — AI 분류 (인용이 원문에서 확인된 것만)
  const misleading = kept.filter((f) => f.category !== "성별·연령 차별 표현");
  if (!extraction) {
    items.push({
      item: "표현",
      status: "확인 불가",
      note: "AI 분류를 받지 못해 표현을 확인할 수 없습니다.",
      source: "잡체크 검증 기준표",
      basis: "AI 분류",
    });
  } else if (misleading.length > 0) {
    items.push({
      item: "표현",
      status: "확인 필요",
      note: `기준표에 해당하는 구절 ${misleading.length}곳이 있습니다. 아래 공고 원문에 표시했습니다.`,
      source: "잡체크 검증 기준표",
      basis: "AI 분류",
    });
  } else {
    items.push({
      item: "표현",
      status: "확인됨",
      note: "기준표의 현혹 우려 표현이나 모호한 업무 범위에 해당하는 구절을 찾지 못했습니다.",
      source: "잡체크 검증 기준표",
      basis: "AI 분류",
    });
  }

  // 4. 법정 기준 — 최저임금은 계산, 차별 표현은 AI 인용
  const discrimination = kept.filter((f) => f.category === "성별·연령 차별 표현");
  const hourly = extraction ? hourlyWage(extraction.wage) : null;
  const notes: string[] = [];
  let legal: CheckItemResult["status"] = "확인됨";
  if (hourly != null && hourly < MINIMUM_WAGE_2026) {
    legal = "확인 필요";
    notes.push(`시간급으로 환산하면 약 ${won(hourly)}으로 2026년 최저임금(${won(MINIMUM_WAGE_2026)})보다 낮습니다.`);
  } else if (hourly != null) {
    notes.push(`시간급 환산 약 ${won(hourly)}으로 2026년 최저임금 이상입니다.`);
  }
  if (discrimination.length > 0) {
    legal = "확인 필요";
    notes.push(`성별·연령 등 차별로 볼 수 있는 구절 ${discrimination.length}곳이 있습니다.`);
  }
  if (!extraction) {
    legal = "확인 불가";
    notes.push("공고 정보를 추출하지 못했습니다.");
  } else if (hourly == null && legal === "확인됨") {
    legal = "확인 불가";
    notes.push("공고에 적힌 임금·근무시간으로는 최저임금 충족 여부를 계산할 수 없습니다.");
  }
  items.push({
    item: "법정 기준",
    status: legal,
    note: notes.join(" "),
    source: "최저임금법, 남녀고용평등법 등",
    basis: discrimination.length > 0 ? "AI 분류" : "계산",
  });

  // 5. 구인자 이력 — 명단공개 데이터 (연동 예정)
  items.push({
    item: "구인자 이력",
    status: "확인 불가",
    note: `${input.historyReason}입니다.`,
    source: "고용노동부 명단공개, 정부 사례 검색",
    basis: "연동 예정",
  });

  return items;
}
