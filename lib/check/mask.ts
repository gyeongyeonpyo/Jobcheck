// 개인 연락처를 가린 뒤에만 LLM으로 보낸다 (명세 10-2).
// 사업자등록번호(000-00-00000)는 구인자 실재 확인에 필요하므로 가리지 않는다.

const patterns: { re: RegExp; label: string }[] = [
  { re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, label: "[이메일]" },
  // 휴대전화·일반전화·대표번호 (하이픈·점·공백 구분 포함)
  { re: /(?<!\d)(?:\+?82[-.\s]?)?0\d{1,2}[-.\s)]?\d{3,4}[-.\s]?\d{4}(?!\d)/g, label: "[전화번호]" },
  { re: /(?<!\d)1[5-9]\d{2}[-.\s]?\d{4}(?!\d)/g, label: "[전화번호]" },
  // 메신저 아이디 (카톡 ID, 텔레그램 등)
  {
    re: /((?:카카오톡|카톡|오픈채팅|텔레그램|telegram|kakao)\s*(?:id|ID|아이디)?\s*[:：]?\s*)@?[A-Za-z0-9_.-]{3,}/gi,
    label: "$1[메신저 ID]",
  },
  { re: /https?:\/\/open\.kakao\.com\/\S+/gi, label: "[오픈채팅 링크]" },
  { re: /https?:\/\/t\.me\/\S+/gi, label: "[텔레그램 링크]" },
  // 주민등록번호 형태
  { re: /(?<!\d)\d{6}[-\s]?[1-4]\d{6}(?!\d)/g, label: "[주민등록번호]" },
];

// "담당자 홍길동", "담당: 김OO" 처럼 담당자 이름이 붙은 경우
const contactName = /((?:담당자|담당|채용담당|인사담당)\s*[:：]?\s*)([가-힣]{2,4})(?=\s|$|[,.)/]|님|과장|대리|팀장|주임|사원|실장|부장)/g;

export function maskPersonalInfo(text: string): string {
  let out = text;
  for (const { re, label } of patterns) out = out.replace(re, label);
  out = out.replace(contactName, "$1[담당자]");
  return out;
}
