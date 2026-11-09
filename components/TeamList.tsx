import { team } from "@/lib/content";

// 이름·사진·연락처는 게시하지 않고 역할과 경력만 보여 준다 (명세 6).
export default function TeamList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
      {team.map((m) => (
        <li key={m.role} className="border-t-2 border-ink pt-4">
          <p className="text-lg font-bold">{m.role}</p>
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
