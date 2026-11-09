import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import RequestForm from "@/components/RequestForm";

export const metadata: Metadata = { title: "직업소개 Match (오픈 예정)" };

export default function MatchPage() {
  return (
    <PageShell
      title="채용이 어려운 기업과 청년을 일대일로 연결합니다."
      lead={
        <>
          <p>
            <span className="mr-2 inline-flex rounded-full bg-mist px-2.5 py-1 text-[14px] font-semibold text-ink ring-1 ring-line">
              오픈 예정
            </span>
            2027년 4~8월 시범 운영 예정입니다. 유료직업소개 등록 요건을 충족하지 못하면 개시가 늦어질 수
            있습니다.
          </p>
          <p>
            초기 직무군은 디지털·미디어·정책조사 분야 신입·주니어입니다. 요금은 채용이 성사된 뒤 고시
            상한(3개월 임금의 30%) 이내에서 받습니다.
          </p>
          <p>검증 부문과 직업소개 부문은 분리 운영하며, 같은 채용 건을 두 부문에서 함께 다루지 않습니다.</p>
        </>
      }
    >
      <RequestForm kind="match" />
    </PageShell>
  );
}
