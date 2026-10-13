export function SectionHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2.5">
      <h2 className="font-display text-[19px] font-bold">{title}</h2>
      {children}
    </div>
  );
}
