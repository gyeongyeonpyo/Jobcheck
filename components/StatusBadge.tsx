// 상태는 색만으로 구분하지 않는다: 아이콘 + 글자 + 색 (명세 11 접근성)
export type CheckStatus = "확인됨" | "확인 필요" | "확인 불가";

const styles: Record<CheckStatus, string> = {
  확인됨: "bg-ok-wash text-ok",
  "확인 필요": "bg-caution-wash text-caution",
  "확인 불가": "bg-unknown-wash text-unknown",
};

function Icon({ status }: { status: CheckStatus }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (status === "확인됨")
    return (
      <svg {...common}>
        <path d="M3.5 8.5l3 3 6-7" />
      </svg>
    );
  if (status === "확인 필요")
    return (
      <svg {...common}>
        <path d="M8 2.5l6 11H2z" />
        <path d="M8 7v2.5M8 11.6v.1" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M5.5 8h5" />
    </svg>
  );
}

export default function StatusBadge({ status }: { status: CheckStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[14px] font-semibold leading-none ${styles[status]}`}
    >
      <Icon status={status} />
      {status}
    </span>
  );
}

export function PartnerBadge({ status }: { status: string }) {
  const confirmed = status === "선정";
  return (
    <span
      className={`inline-flex shrink-0 items-center self-start rounded-full px-2.5 py-1 text-[14px] font-semibold leading-none ${
        confirmed ? "bg-ok-wash text-ok" : "bg-mist text-ink-soft ring-1 ring-line"
      }`}
    >
      {status}
    </span>
  );
}
