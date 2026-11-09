import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import RequestForm from "@/components/RequestForm";

export const metadata: Metadata = { title: "기관·제휴 문의" };

export default function ContactPage() {
  return (
    <PageShell
      title="기관·제휴 문의"
      lead={
        <p>
          한국직업정보협회, 자치구, 대학 등 기관의 모니터링 위탁·용역과 채용공고 서비스의 검증 결과 제휴(API)
          문의를 받습니다.
        </p>
      }
    >
      <RequestForm kind="contact" />
    </PageShell>
  );
}
