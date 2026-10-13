export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-card border border-dashed border-line bg-surface px-5 py-6 text-center text-muted">
      {children}
    </div>
  );
}
