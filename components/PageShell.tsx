export default function PageShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-12 md:px-8 md:pt-20">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-balance text-[28px] font-bold leading-[1.35] tracking-[-0.015em] md:text-[38px]">
          {title}
        </h1>
        {lead ? <div className="mt-4 space-y-3 text-ink-soft">{lead}</div> : null}
        {children}
      </div>
    </div>
  );
}
