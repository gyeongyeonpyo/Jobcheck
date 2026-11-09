import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import RequestForm from "@/components/RequestForm";
import ReportSpecimen from "@/components/ReportSpecimen";
import CorrectionDraft from "@/components/CorrectionDraft";
import { performanceTargets } from "@/lib/content";

export const metadata: Metadata = { title: "구인광고 사전검증 의뢰" };

export default function VerifyPage() {
  return (
    <PageShell
      title="구인광고 1차 점검을 맡겨 주세요."
      lead={
        <>
          <p>
            공고를 보내 주시면 AI 1차 분류, 공공데이터 대조, 잡체크 직접 검토를 거쳐 확인사항 리포트를
            보내 드립니다. 확인이 필요한 항목이 있으면 구인자에게 바로 보낼 수 있는 수정 요청 문안도 함께
            드립니다. 검증 기록은 보관해 행정처분 대응 자료로 쓸 수 있습니다.
          </p>
          <p>사전검증 구독 가격은 확정 후 안내합니다. {/* TODO: 명세 14 구독 가격 */}</p>
        </>
      }
    >
      <ReportSpecimen />

      <section id="draft" aria-labelledby="draft-title" className="mt-14 scroll-mt-24">
        <h2 id="draft-title" className="text-[22px] font-bold">구인자에게 보낼 수정 요청 문안</h2>
        <p className="mt-2 text-ink-soft">
          위 리포트에서 확인이 필요한 항목(임금 수준, 표현)을 바탕으로 만든 문안입니다.
          <span className="block">복사해서 구인자에게 메일이나 메시지로 바로 보낼 수 있습니다.</span>
        </p>
        <div className="mt-6">
          <CorrectionDraft />
        </div>
      </section>

      <h2 className="mt-10 font-bold">운영 목표</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
        {performanceTargets.map((t) => (
          <li key={t}>{t} (목표)</li>
        ))}
      </ul>

      <h2 className="mt-14 text-[22px] font-bold">검증 의뢰</h2>
      <RequestForm kind="verify" />
    </PageShell>
  );
}
