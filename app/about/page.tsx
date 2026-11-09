import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import TeamList from "@/components/TeamList";
import Roadmap from "@/components/Roadmap";
import { PartnerBadge } from "@/components/StatusBadge";
import { incubation, partners } from "@/lib/content";

export const metadata: Metadata = { title: "팀과 협력 네트워크" };
export const revalidate = 3600;

export default function AboutPage() {
  return (
    <PageShell
      title="팀과 협력 네트워크"
      lead={<p>{/* TODO(명세 14): 창업 취지 문구 */}[창업 취지 문구 작성 예정]</p>}
    >
      <h2 className="mt-12 text-[22px] font-bold">팀</h2>
      <div className="mt-6">
        <TeamList />
      </div>

      <h2 className="mt-16 text-[22px] font-bold">협력 네트워크</h2>
      <ul className="mt-4">
        {partners.map((p) => (
          <li key={p.name} className="flex flex-col gap-2 border-b border-line py-4 sm:flex-row sm:justify-between sm:gap-6">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-[15px] text-ink-soft">{p.what}</p>
            </div>
            <PartnerBadge status={p.status} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[15px] text-ink-soft">{incubation}</p>

      <h2 className="mt-16 text-[22px] font-bold">로드맵</h2>
      <div className="mt-6">
        <Roadmap />
      </div>
    </PageShell>
  );
}
