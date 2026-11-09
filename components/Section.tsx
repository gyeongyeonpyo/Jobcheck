// 왼쪽 좁은 열: 스크롤해도 따라오는 섹션 이름 / 오른쪽 넓은 열: 내용 (DESIGN_REFERENCE.md 2장)
// 모바일에서는 섹션 이름이 내용 위로 쌓인다.
export default function Section({
  id,
  label,
  title,
  tone = "paper",
  children,
}: {
  id: string;
  label: string;
  title?: React.ReactNode;
  tone?: "paper" | "mist";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-label`}
      className={tone === "mist" ? "bg-mist" : "bg-paper"}
    >
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-20 md:grid-cols-[280px_1fr] md:gap-10 md:px-8 md:py-28">
        <div>
          <h2
            id={`${id}-label`}
            className="text-[15px] font-bold tracking-[0.02em] text-ink md:sticky md:top-28"
          >
            {label}
          </h2>
        </div>
        <div className="min-w-0 max-w-[760px]">
          {title ? (
            <p className="mb-10 max-w-[640px] text-[22px] font-semibold leading-[1.45] tracking-[-0.01em] md:text-[28px]">
              {title}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
