import { initials } from "@/domain/initials";

export function Avatar({ name }: { name: string | null | undefined }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent"
    >
      {initials(name)}
    </div>
  );
}
