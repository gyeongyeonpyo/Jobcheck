export const revalidate = 3600; // 로드맵 "진행 중" 표시를 시간 단위로 갱신

import Link from "next/link";
import Section from "@/components/Section";
import Countdown from "@/components/Countdown";
import ReportSpecimen from "@/components/ReportSpecimen";
import { PartnerBadge } from "@/components/StatusBadge";
import Roadmap from "@/components/Roadmap";
import TeamList from "@/components/TeamList";
import {
  audiences,
  checkItems,
  comparisons,
  hero,
  incubation,
  monitoringFacts,
  monitoringTiers,
  partners,
  penalties,
  positioning,
  precheckTargets,
  processSteps,
  reportCounts,
  reportCountsSource,
} from "@/lib/content";

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-ink px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-signal";
const secondaryButton =
  "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold text-ink ring-1 ring-line ring-inset transition-colors hover:bg-mist";

export default function Home() {
  const maxCount = Math.max(...reportCounts.map((r) => r.value));

  return (
    <>
      {/* 1. 히어로 — 문장 하나 (명세 1장 확정 카피) */}
      <section aria-labelledby="hero-title" className="px-4">
        {/* 모바일: 하단 고정 내비(약 80px)에 시행일 띠가 가리지 않도록 높이를 뺀다 */}
        <div className="mx-auto flex min-h-[calc(100dvh-64px-58px-84px)] max-w-[760px] flex-col items-center justify-center py-16 text-center md:min-h-[calc(100dvh-80px-58px)] md:py-20">
          <h1
            id="hero-title"
            className="text-balance text-[26px] leading-[1.45] tracking-[-0.015em] md:text-[38px] md:leading-[1.4]"
          >
            <span className="font-bold">{hero.lead}</span>{" "}
            <span className="font-normal text-ink-soft">{hero.rest}</span>
          </h1>
          <div className="mt-12 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/verify" className={primaryButton}>
              검증 의뢰하기
            </Link>
            <Link href="/guide" className={secondaryButton}>
              시행 대응 가이드 받기
            </Link>
          </div>
          <p className="mt-8 text-[15px] text-ink-soft">
            구직자이신가요?{" "}
            <Link href="/check" className="font-semibold text-signal underline underline-offset-4">
              공고 무료 확인
            </Link>
          </p>
        </div>
      </section>

      {/* 2. 시행일 띠 */}
      <Countdown />

      {/* 3. 문제 */}
      <Section
        id="problem"
        label="문제"
        title="거짓 구인광고는 늘고, 게재 전 확인은 사업자의 일이 됩니다."
      >
        <figure>
          <figcaption className="text-[15px] font-semibold">거짓 구인광고 신고 건수</figcaption>
          <dl className="mt-5 space-y-4">
            {reportCounts.map((r) => (
              <div key={r.label} className="grid grid-cols-[96px_1fr] items-center gap-3 md:grid-cols-[128px_1fr] md:gap-4">
                <dt className="text-[15px] text-ink-soft">{r.label}</dt>
                <dd className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-7 rounded-r-md bg-ink"
                    style={{ width: `${(r.value / maxCount) * 72}%` }}
                  />
                  <span className="tnum whitespace-nowrap font-bold">{r.value}건</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[14px] text-ink-soft">
            {reportCountsSource}. 2026년은 상반기(6개월) 집계입니다. 피해는 청년 구직자에게 집중됩니다.
          </p>
        </figure>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-bold">게재 전 확인 대상 광고 (입법예고안)</h3>
            <ul className="mt-4 space-y-2.5 text-[16px] leading-relaxed">
              {precheckTargets.map((t) => (
                <li key={t} className="border-l-2 border-signal pl-3">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold">위반 시 행정처분</h3>
            <table className="mt-4 w-full text-left text-[16px]">
              <tbody>
                {penalties.map((p) => (
                  <tr key={p.order} className="border-b border-line">
                    <th scope="row" className="py-3 pr-4 font-medium text-ink-soft">
                      {p.order}
                    </th>
                    <td className="py-3 font-semibold">{p.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[14px] text-ink-soft">
              게재 중인 광고도 고용노동부가 모니터링하며 수정 요청, 게시 중지, 삭제 의무가 생깁니다.
            </p>
          </div>
        </div>
      </Section>

      {/* 4. 정부 체계 속 잡체크의 위치 */}
      <Section
        id="position"
        label="정부 체계 속 위치"
        tone="mist"
        title="정부 모니터링 체계에서 1차 점검은 각 사업자의 몫입니다. 잡체크가 이 단계를 대행합니다."
      >
        <ol className="relative space-y-3" aria-label="구인광고 모니터링 단계">
          {monitoringTiers.map((t) => (
            <li
              key={t.name}
              className={
                t.ours
                  ? "rounded-card bg-signal p-5 text-white shadow-lift md:p-6"
                  : "rounded-card bg-paper p-5 ring-1 ring-line md:p-6"
              }
            >
              <p className="text-lg font-bold">{t.name}</p>
              <p className={t.ours ? "mt-1 text-white/90" : "mt-1 text-ink-soft"}>{t.owner}</p>
              {t.ours ? <p className="mt-3 font-semibold">이 단계를 잡체크가 대행합니다.</p> : null}
            </li>
          ))}
        </ol>
        <ul className="mt-8 space-y-2 text-[16px] leading-relaxed text-ink-soft">
          {monitoringFacts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Section>

      {/* 5. 어떻게 검증하나요 */}
      <Section
        id="how"
        label="어떻게 검증하나요"
        title="AI 분류, 공공데이터 대조, 사람 검토를 거쳐 확인 기록을 남깁니다."
      >
        <ol className="space-y-6">
          {processSteps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[40px_1fr] gap-4">
              <span
                aria-hidden="true"
                className="tnum grid size-10 place-items-center rounded-full bg-mist font-bold text-ink"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-bold">{s.title}</p>
                <p className="text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <ReportSpecimen />

        <div className="mt-14">
          <h3 className="font-bold">검증 항목과 근거 자료</h3>
          <ul className="mt-4 md:hidden">
            {checkItems.map((c) => (
              <li key={c.item} className="border-b border-line py-3.5">
                <p className="font-semibold">{c.item}</p>
                <p className="text-[15px]">{c.what}</p>
                <p className="text-[14px] text-ink-soft">근거: {c.source}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 hidden md:block">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className="py-2.5 pr-4 font-semibold">항목</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">확인 내용</th>
                  <th scope="col" className="py-2.5 font-semibold">근거 자료</th>
                </tr>
              </thead>
              <tbody>
                {checkItems.map((c) => (
                  <tr key={c.item} className="border-b border-line align-top">
                    <th scope="row" className="py-3 pr-4 font-semibold">{c.item}</th>
                    <td className="py-3 pr-4">{c.what}</td>
                    <td className="py-3 text-ink-soft">{c.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* 6. 누구를 위한 서비스인가 — 사업자 카드가 주인공 */}
      <Section id="who" label="누구를 위한 서비스인가" tone="mist">
        <article className="rounded-card bg-paper p-6 shadow-soft ring-1 ring-line md:p-10">
          <h3 className="text-[24px] font-bold leading-snug md:text-[30px]">{audiences.primary.who}</h3>
          <dl className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <dt className="text-[15px] text-ink-soft">필요한 것</dt>
              <dd className="mt-1 font-semibold">{audiences.primary.need}</dd>
            </div>
            <div>
              <dt className="text-[15px] text-ink-soft">잡체크가 하는 일</dt>
              <dd className="mt-1 font-semibold">{audiences.primary.give}</dd>
            </div>
          </dl>
          <Link href={audiences.primary.href} className={`${primaryButton} mt-8`}>
            {audiences.primary.cta}
          </Link>
        </article>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {audiences.others.map((a) => (
            <li key={a.who} className="flex flex-col rounded-card bg-paper p-5 ring-1 ring-line">
              <h3 className="font-bold leading-snug">{a.who}</h3>
              <p className="mt-2 flex-1 text-[15px] text-ink-soft">{a.give}</p>
              <Link
                href={a.href}
                className="mt-4 text-[15px] font-semibold text-signal underline underline-offset-4"
              >
                {a.cta}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* 7. 차별점 */}
      <Section id="compare" label="다른 방법과 비교" title={positioning}>
        <div className="hidden md:block">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="w-[26%] py-2.5 pr-4 font-semibold">대안</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">중소 사업자 입장의 한계</th>
                <th scope="col" className="bg-signal-wash px-4 py-2.5 font-semibold">잡체크</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c) => (
                <tr key={c.option} className="border-b border-line align-top">
                  <th scope="row" className="py-3.5 pr-4 font-semibold">{c.option}</th>
                  <td className="py-3.5 pr-4 text-ink-soft">{c.limit}</td>
                  <td className="bg-signal-wash px-4 py-3.5 font-medium">{c.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-3 md:hidden">
          {comparisons.map((c) => (
            <li key={c.option} className="rounded-card p-5 ring-1 ring-line">
              <p className="font-bold">{c.option}</p>
              <p className="mt-2 text-[15px] text-ink-soft">한계: {c.limit}</p>
              <p className="mt-2 rounded-small bg-signal-wash px-3 py-2 text-[15px] font-medium">
                잡체크: {c.ours}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 8. 무료 가이드 */}
      <section aria-labelledby="guide-title" className="bg-ink text-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-16 md:grid-cols-[280px_1fr] md:gap-10 md:px-8 md:py-20">
          <div aria-hidden="true" className="hidden md:block">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 6h20l10 10v34H14z" />
              <path d="M34 6v10h10M20 26h16M20 32h16M20 38h9" />
              <circle cx="38" cy="42" r="7" />
            </svg>
          </div>
          <div className="max-w-[640px]">
            <h2 id="guide-title" className="text-[22px] font-bold leading-snug md:text-[28px]">
              「&apos;26.12.10. 시행 대응 가이드」를 무료로 받아 보세요.
            </h2>
            <p className="mt-3 text-white/80">
              입법예고 의견 50건 가운데 신원 확인 의무를 &lsquo;폐지&rsquo;로 오해한 의견이
              11건이었습니다. 무엇이 바뀌는지 사업자 입장에서 정리했습니다.
            </p>
            <Link
              href="/guide"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-paper px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-signal-wash"
            >
              가이드 받기
            </Link>
          </div>
        </div>
      </section>

      {/* 9. 팀 & 협력 네트워크 */}
      <Section id="team" label="팀과 협력 네트워크">
        <TeamList compact />
        <h3 className="mt-14 font-bold">협력 네트워크</h3>
        <ul className="mt-4">
          {partners.map((p) => (
            <li
              key={p.name}
              className="flex flex-col gap-2 border-b border-line py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-[15px] text-ink-soft">{p.what}</p>
              </div>
              <PartnerBadge status={p.status} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[15px] text-ink-soft">{incubation}</p>
      </Section>

      {/* 10. 로드맵 */}
      <Section id="roadmap" label="로드맵" tone="mist">
        <Roadmap />
      </Section>
    </>
  );
}
