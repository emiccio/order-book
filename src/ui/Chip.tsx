const TONE_CLASSES = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  neutral: "bg-sunk text-muted",
  accent: "bg-accent-soft text-accent",
  danger: "bg-danger-soft text-danger",
} as const;

export function Chip({
  tone,
  children,
}: {
  tone: keyof typeof TONE_CLASSES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`num inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
