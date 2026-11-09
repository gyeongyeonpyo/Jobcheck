import Link from "next/link";
import { notices } from "@/lib/content";

const groups = [
  {
    title: "서비스",
    links: [
      { href: "/verify", label: "구인광고 사전검증" },
      { href: "/check", label: "공고 무료 확인" },
      { href: "/match", label: "직업소개 Match (오픈 예정)" },
      { href: "/guide", label: "시행 대응 가이드" },
    ],
  },
  {
    title: "잡체크",
    links: [
      { href: "/about", label: "팀과 협력 네트워크" },
      { href: "/contact", label: "기관·제휴 문의" },
      { href: "/terms", label: "이용약관" },
      { href: "/privacy", label: "개인정보처리방침" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink pb-28 text-white/80 md:pb-0">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 py-16 md:grid-cols-[280px_1fr] md:px-8 md:py-20">
        <div>
          <p className="text-xl font-bold text-white">잡체크</p>
          <p className="mt-2 text-[15px] leading-relaxed">구인광고 사전검증 및 청년 취업 연결 서비스</p>
        </div>
        <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
          <ul className="max-w-[640px] space-y-3 text-[15px] leading-relaxed">
            {notices.map((n) => (
              <li key={n} className="border-l-2 border-white/25 pl-4">
                {n}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-8 text-[15px]">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="font-semibold text-white">{g.title}</p>
                <ul className="mt-3 space-y-2">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:text-white hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1280px] flex-wrap gap-x-8 gap-y-1 px-4 py-6 text-sm text-white/60 md:px-8">
          {/* TODO: 공식 문의 이메일·도메인 확정 후 표기 (명세 14) */}
          <p>문의 이메일 [작성 예정]</p>
          <p>예비창업 단계, 2027년 4월 법인설립 예정</p>
        </div>
      </div>
    </footer>
  );
}
