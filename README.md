# 잡체크 홈페이지

구인광고 사전검증 서비스 잡체크(JOBCHECK)의 웹사이트입니다. 내용과 문구 기준은 `CLAUDE.md`(명세서), 디자인 참고는 `DESIGN_REFERENCE.md`입니다.

Next.js (App Router) + TypeScript + Tailwind CSS 4, 글꼴은 Pretendard입니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 공고 확인 백엔드 단위 테스트
npm run build      # 프로덕션 빌드
```

## 환경변수 (서버 전용, Vercel 환경변수에 등록)

| 이름 | 용도 | 없을 때 |
|---|---|---|
| `ANTHROPIC_API_KEY` | `/check` 공고 확인의 AI 분류 (Claude API, `claude-opus-5-5`) | `/check`가 "오픈 예정" 안내로 바뀜 |
| `NTS_SERVICE_KEY` | 국세청 사업자 상태 조회 (공공데이터포털) | 구인자 실재 항목이 "확인 불가" |
| `SUBMISSIONS_WEBHOOK_URL` | 검증 의뢰·가이드·Match·문의 폼 접수 전달 (Slack, Make 등) | 폼이 "온라인 접수 준비 중"으로 응답 (접수했다고 말하지 않음) |

## 구조

```
app/                  페이지 (/, /check, /verify, /guide, /match, /about, /contact, /terms, /privacy)
app/api/check         공고 확인 API
app/api/requests      접수 폼 API
components/           화면 구성 요소
lib/content.ts        사이트 문구·데이터 (명세서의 사실만)
lib/check/            공고 확인 백엔드
  mask.ts             개인 연락처 마스킹
  fetchPosting.ts     공고 URL 수집 (내부망 차단)
  prompt.ts           시스템 프롬프트와 검증 기준표 (캐싱 대상)
  llm.ts              Claude 호출 (구조화 출력, 거부 시 대체 모델)
  rules.ts            인용 검증, 최저임금 계산, 항목별 상태 규칙
  publicData.ts       공공데이터 조회 (일부 연동 예정)
  pipeline.ts         전체 흐름
```

## 공고 확인(`/check`) 원칙

- AI는 공고 정보 추출과 문제 구절 인용만 합니다. 항목별 상태(확인됨, 확인 필요, 확인 불가)는 `rules.ts`의 코드 규칙이 정합니다.
- AI가 인용한 구절이 원문에 없으면 버립니다.
- 원문은 저장하지 않습니다. 같은 공고는 해시 기준으로 결과를 재사용합니다.

## 남은 일

명세서 14장 TODO 목록을 따릅니다. 코드 안의 `TODO` 주석이 해당 위치입니다.
