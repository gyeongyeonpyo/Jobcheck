import { z } from "zod";

// 접수 폼 정의 (명세 10-1, 10-3, 10-4, 9 /contact). 화면과 서버 검증이 같은 정의를 쓴다.
export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "email" | "url" | "number" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  hint?: string;
  autoComplete?: string;
};

export type RequestKind = "verify" | "guide" | "match" | "contact";

export const forms: Record<
  RequestKind,
  { title: string; submit: string; done: string; fields: FieldDef[]; consents: string[] }
> = {
  verify: {
    title: "검증 의뢰",
    submit: "검증 의뢰하기",
    done: "검증 의뢰가 접수되었습니다.",
    fields: [
      { name: "company", label: "사업자명", type: "text", required: true, autoComplete: "organization" },
      { name: "contactName", label: "담당자명", type: "text", required: true, autoComplete: "name" },
      { name: "email", label: "이메일", type: "email", required: true, autoComplete: "email" },
      { name: "postingCount", label: "월 평균 공고 건수", type: "number" },
      { name: "message", label: "문의 내용", type: "textarea" },
    ],
    consents: [
      "개인정보 수집·이용에 동의합니다. (수집 항목: 사업자명, 담당자명, 이메일. 목적: 검증 의뢰 처리와 회신)",
      "검증 결과는 의뢰인에게만 제공되며, 위법 여부를 판정하지 않는다는 점을 확인했습니다.",
    ],
  },
  guide: {
    title: "시행 대응 가이드",
    submit: "가이드 받기",
    done: "신청이 접수되었습니다. 가이드가 준비되면 이메일로 보내 드립니다.",
    fields: [
      { name: "email", label: "이메일", type: "email", required: true, autoComplete: "email" },
      {
        name: "segment",
        label: "구분",
        type: "select",
        required: true,
        options: ["직업정보제공사업자", "협회·기관", "구인 기업", "구직자", "기타"],
      },
    ],
    consents: ["개인정보 수집·이용에 동의합니다. (수집 항목: 이메일, 구분. 목적: 가이드 발송)"],
  },
  match: {
    title: "채용 의뢰 사전 신청",
    submit: "사전 신청하기",
    done: "사전 신청이 접수되었습니다. 시범 운영이 시작되면 연락드립니다.",
    fields: [
      { name: "company", label: "기업명", type: "text", required: true, autoComplete: "organization" },
      { name: "contactName", label: "담당자", type: "text", required: true, autoComplete: "name" },
      { name: "email", label: "이메일", type: "email", required: true, autoComplete: "email" },
      { name: "role", label: "직무", type: "text", required: true },
      {
        name: "employmentType",
        label: "고용형태",
        type: "select",
        required: true,
        options: ["정규직", "계약직", "인턴", "기타"],
      },
      { name: "when", label: "희망 시기", type: "text" },
    ],
    consents: ["개인정보 수집·이용에 동의합니다. (수집 항목: 기업명, 담당자, 이메일. 목적: 사전 신청 회신)"],
  },
  contact: {
    title: "기관·제휴 문의",
    submit: "문의 보내기",
    done: "문의가 접수되었습니다.",
    fields: [
      { name: "org", label: "기관·회사명", type: "text", required: true, autoComplete: "organization" },
      { name: "contactName", label: "담당자", type: "text", required: true, autoComplete: "name" },
      { name: "email", label: "이메일", type: "email", required: true, autoComplete: "email" },
      {
        name: "topic",
        label: "문의 유형",
        type: "select",
        required: true,
        options: ["모니터링 위탁·용역", "제휴(API)", "기타"],
      },
      { name: "message", label: "문의 내용", type: "textarea", required: true },
    ],
    consents: ["개인정보 수집·이용에 동의합니다. (수집 항목: 기관명, 담당자, 이메일. 목적: 문의 회신)"],
  },
};

export function schemaFor(kind: RequestKind) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of forms[kind].fields) {
    let s: z.ZodType;
    if (f.type === "email") s = z.email().max(200);
    else if (f.type === "url") s = z.url().max(2000);
    else if (f.type === "select") s = z.enum(f.options as [string, ...string[]]);
    else if (f.type === "number") s = z.coerce.number().int().min(0).max(1_000_000);
    else s = z.string().trim().min(1).max(f.type === "textarea" ? 20_000 : 200);
    shape[f.name] = f.required ? s : z.union([s, z.literal("")]).optional();
  }
  shape.consents = z.array(z.literal(true)).length(forms[kind].consents.length);
  return z.object(shape);
}
