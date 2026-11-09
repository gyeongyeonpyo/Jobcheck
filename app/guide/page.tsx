import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import RequestForm from "@/components/RequestForm";
import { precheckTargets } from "@/lib/content";

export const metadata: Metadata = { title: "시행 대응 가이드" };

export default function GuidePage() {
  return (
    <PageShell
      title="「'26.12.10. 시행 대응 가이드」"
      lead={
        <p>
          개정 직업안정법이 2026년 12월 10일 시행됩니다. 직업정보제공사업자에게 구인광고 허위·과장 여부의
          모니터링·검증 의무가 생깁니다. 입법예고 의견 50건 가운데 신원 확인 의무를 &lsquo;폐지&rsquo;로
          오해한 의견이 11건이었습니다. 무엇이 바뀌는지 사업자 입장에서 정리한 가이드를 이메일로 보내
          드립니다.
        </p>
      }
    >
      {/* TODO(명세 14): 가이드 PDF 완성 후 다운로드 연결 */}
      <h2 className="mt-10 font-bold">입법예고안상 게재 전 확인 대상 광고</h2>
      <ul className="mt-3 space-y-2">
        {precheckTargets.map((t) => (
          <li key={t} className="border-l-2 border-signal pl-3">
            {t}
          </li>
        ))}
      </ul>
      <RequestForm kind="guide" />
    </PageShell>
  );
}
