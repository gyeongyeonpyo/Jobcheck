// 공공데이터 대조. 사실 확인은 LLM이 아니라 여기서 한다 (명세 10-2).
// 베타 시점에는 키가 없거나 데이터가 준비되지 않은 항목을 '확인 불가'로 돌려준다.

export type BusinessStatus =
  | { kind: "active" }
  | { kind: "suspended" | "closed"; label: string }
  | { kind: "not_registered" }
  | { kind: "unavailable"; reason: string };

// 국세청 사업자등록 상태조회 (공공데이터포털 data.go.kr)
// TODO: 서비스키 발급 후 Vercel 환경변수 NTS_SERVICE_KEY에 등록. 키가 없으면 '확인 불가'.
export async function lookupBusinessStatus(businessNumber: string): Promise<BusinessStatus> {
  const key = process.env.NTS_SERVICE_KEY;
  if (!key) return { kind: "unavailable", reason: "국세청 조회 연동 예정" };
  const b_no = businessNumber.replace(/\D/g, "");
  if (b_no.length !== 10) return { kind: "unavailable", reason: "사업자등록번호 형식이 올바르지 않음" };

  try {
    const res = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ b_no: [b_no] }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return { kind: "unavailable", reason: "국세청 조회 응답 오류" };
    const json = (await res.json()) as { data?: { b_stt_cd?: string; b_stt?: string; tax_type?: string }[] };
    const row = json.data?.[0];
    if (!row) return { kind: "unavailable", reason: "국세청 조회 결과 없음" };
    if (row.b_stt_cd === "01") return { kind: "active" };
    if (row.b_stt_cd === "02") return { kind: "suspended", label: row.b_stt || "휴업자" };
    if (row.b_stt_cd === "03") return { kind: "closed", label: row.b_stt || "폐업자" };
    return { kind: "not_registered" };
  } catch {
    return { kind: "unavailable", reason: "국세청 조회 시간 초과" };
  }
}

// TODO(명세 14): 고용형태별근로실태조사 직종별 임금표를 정리해 연동
export async function lookupWageBenchmark(): Promise<{ available: false; reason: string }> {
  return { available: false, reason: "직종별 임금 통계 대조 연동 예정" };
}

// TODO(명세 12): 고용노동부 임금체불 명단공개 데이터 연동
export async function lookupEmployerHistory(): Promise<{ available: false; reason: string }> {
  return { available: false, reason: "임금체불 명단공개 데이터 연동 예정" };
}
