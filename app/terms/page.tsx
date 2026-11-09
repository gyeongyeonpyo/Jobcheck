import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "이용약관" };

export default function Page() {
  return (
    <PageShell
      title="이용약관"
      lead={<p>[작성 예정] 자문 노무사 검토 후 게시합니다.</p>}
    >
      {/* TODO(명세 14): 본문. 개인정보처리방침에는 LLM API 사업자(해외) 처리위탁·국외이전 고지 포함 */}
      <></>
    </PageShell>
  );
}
