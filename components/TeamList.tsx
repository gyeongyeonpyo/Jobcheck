import { team } from "@/lib/content";

// 사진은 받기 전까지 이니셜 아바타 (명세 6). 연락처·생년월일은 게시하지 않는다.
export default function TeamList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
      {team.map((m) => (
        <li key={m.name}>
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-mist text-xl font-bold text-ink ring-1 ring-line"
          >
            {m.initials}
          </span>
          <p className="mt-4 text-lg font-bold">{m.name}</p>
          <p className="text-[15px] text-ink-soft">{m.role}</p>
          <p className="mt-2 text-[15px] leading-relaxed">{m.does}</p>
          {compact ? null : (
            <ul className="mt-3 space-y-1 text-[14px] leading-relaxed text-ink-soft">
              {m.bio.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
