import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import RequestForm from "@/components/RequestForm";
import ReportSpecimen from "@/components/ReportSpecimen";
import { checkItems, performanceTargets } from "@/lib/content";

export const metadata: Metadata = { title: "구인광고 사전검증 의뢰" };

export default function VerifyPage() {
  return (
    <PageShell
      title="구인광고 1차 점검을 맡겨 주세요."
      lead={
        <>
          <p>
            공고를 보내 주시면 AI 1차 분류, 공공데이터 대조, 잡체크 직접 검토를 거쳐 확인사항 리포트를
            보내 드립니다. 검증 기록은 보관해 행정처분 대응 자료로 쓸 수 있습니다.
          </p>
          <p>사전검증 구독 가격은 확정 후 안내합니다. {/* TODO: 명세 14 구독 가격 */}</p>
        </>
      }
    >
      <ReportSpecimen />

      <h2 className="mt-14 font-bold">확인하는 항목</h2>
      <ul className="mt-3">
        {checkItems.map((c) => (
          <li key={c.item} className="border-b border-line py-3">
            <span className="font-semibold">{c.item}</span>
            <span className="text-ink-soft">: {c.what}</span>
          </li>
        ))}
      </ul>

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
