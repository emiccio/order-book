export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-xl font-bold">Sin conexión</h1>
      <p className="text-muted">
        La Libreta necesita internet para cargar y guardar tus datos. Conectate
        y volvé a intentar.
      </p>
    </main>
  );
}
