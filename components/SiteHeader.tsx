import Image from "next/image";
import Link from "next/link";

// 데스크톱: 상단 가운데 알약 내비 / 모바일: 화면 하단 고정 알약 (DESIGN_REFERENCE.md)
function PillNav({ className }: { className: string }) {
  return (
    <nav aria-label="주요 메뉴" className={className}>
      <ul className="flex items-center gap-1 rounded-full bg-paper/95 p-1.5 shadow-lift ring-1 ring-line backdrop-blur">
        <li>
          <Link
            href="/verify"
            className="block rounded-full bg-ink px-4 py-2 text-[15px] font-semibold text-white transition-colors hover:bg-signal"
          >
            검증 의뢰
          </Link>
        </li>
        <li>
          <Link
            href="/guide"
            className="block rounded-full px-4 py-2 text-[15px] font-medium text-ink transition-colors hover:bg-mist"
          >
            대응 가이드
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:h-20 md:px-8">
          <Link href="/" aria-label="잡체크 홈" className="shrink-0">
            <Image
              src="/jobcheck-logo.png"
              alt="잡체크 JobCheck"
              width={611}
              height={140}
              priority
              className="h-7 w-auto md:h-8"
            />
          </Link>
          <PillNav className="absolute left-1/2 hidden -translate-x-1/2 md:block" />
          <Link
            href="/check"
            className="rounded-full px-3 py-2 text-[15px] font-medium text-ink-soft hover:text-ink"
          >
            공고 무료 확인
          </Link>
        </div>
      </header>
      <PillNav className="fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden" />
    </>
  );
}
