import { z } from "zod";

// LLM이 돌려주는 형식. 사실 판단(상태)은 들어 있지 않다 — 추출과 인용만.
export const LlmExtractionSchema = z.object({
  is_job_posting: z
    .boolean()
    .describe("입력이 구인광고(채용 공고)이면 true, 아니면 false"),
  employer: z.object({
    name: z.string().nullable().describe("공고에 적힌 상호(회사명). 없으면 null"),
    business_number: z
      .string()
      .nullable()
      .describe("공고에 적힌 사업자등록번호(숫자 10자리). 없으면 null. 추측 금지"),
    address: z.string().nullable().describe("근무지 또는 사업장 주소. 없으면 null"),
  }),
  job: z.object({
    title: z.string().nullable().describe("공고 제목 또는 모집 직무"),
    occupation: z.string().nullable().describe("직종을 짧게 (예: 물류 포장, 카페 바리스타)"),
    employment_type: z.string().nullable().describe("고용형태 (예: 정규직, 계약직, 아르바이트, 일용직)"),
  }),
  wage: z.object({
    unit: z
      .enum(["시급", "일급", "주급", "월급", "연봉", "건당", "기타", "없음"])
      .describe("공고에 적힌 임금 단위. 임금 언급이 없으면 '없음'"),
    amount_won: z
      .number()
      .nullable()
      .describe("임금 금액(원). 범위면 가장 낮은 금액. 명시되지 않았으면 null. 계산·추측 금지"),
    daily_hours: z.number().nullable().describe("하루 근무시간(휴게 제외). 공고에 없으면 null"),
    weekly_hours: z.number().nullable().describe("주 근무시간. 공고에 없으면 null"),
    raw: z.string().nullable().describe("임금이 적힌 원문 구절 그대로"),
  }),
  findings: z
    .array(
      z.object({
        quote: z
          .string()
          .describe("문제가 되는 구절을 공고 원문에서 글자 그대로 복사. 바꿔 쓰거나 요약하지 말 것"),
        category: z.enum(["현혹 우려 표현", "모호한 업무 범위", "성별·연령 차별 표현"]),
        reason: z.string().describe("기준표의 어느 항목에 해당하는지 한두 문장"),
      }),
    )
    .describe("기준표에 해당하는 구절. 없으면 빈 배열"),
});
export type LlmExtraction = z.infer<typeof LlmExtractionSchema>;

export type CheckStatus = "확인됨" | "확인 필요" | "확인 불가";
export type CheckItemName = "구인자 실재" | "임금 수준" | "표현" | "법정 기준" | "구인자 이력";

export interface CheckItemResult {
  item: CheckItemName;
  status: CheckStatus;
  note: string;
  source: string;
  basis: "AI 분류" | "공공데이터" | "계산" | "연동 예정";
}

export interface Highlight {
  start: number;
  end: number;
  category: LlmExtraction["findings"][number]["category"];
  reason: string;
}

export interface CheckResponse {
  ok: true;
  postingText: string; // 마스킹된 공고 본문 (강조 표시용)
  highlights: Highlight[];
  items: CheckItemResult[];
  extracted: Pick<LlmExtraction, "employer" | "job" | "wage"> | null;
  droppedQuotes: number; // 원문에서 찾지 못해 버린 AI 인용 수
  aiAvailable: boolean;
}

export interface CheckError {
  ok: false;
  code:
    | "invalid_input"
    | "too_long"
    | "fetch_failed"
    | "blocked_url"
    | "not_job_posting"
    | "rate_limited"
    | "not_configured";
  message: string;
}
