import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad — Libreta de Ventas",
  description: "Qué datos guarda Libreta de Ventas, para qué los usa y cómo pedir que los borren.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-[640px] flex-col gap-8 px-6 py-12">
      <div className="rounded-card border border-dashed border-warn bg-warn-soft px-4 py-3 text-sm text-warn">
        Borrador — este texto todavía no pasó por una revisión legal. No lo
        tomes como la versión final.
      </div>

      <div>
        <h1 className="font-display text-[28px] font-extrabold leading-tight">Privacidad</h1>
        <p className="mt-2 text-muted">
          Esta página explica, en criollo, qué datos guardamos en Libreta de
          Ventas y qué hacemos con ellos.
        </p>
      </div>

      <Section title="Qué datos guardamos">
        <ul className="flex flex-col gap-2">
          <li>Los datos de tu cuenta: nombre y mail.</li>
          <li>Las clientas que cargás: nombre, WhatsApp y notas.</li>
          <li>
            Los pedidos que cargás: productos, precios, pagos y estado de
            entrega.
          </li>
          <li>Las marcas, ciclos y gastos que cargás vos.</li>
        </ul>
        <p className="mt-2 text-sm text-muted">No guardamos ni pedimos datos de tarjetas o pagos.</p>
      </Section>

      <Section title="Para qué los usamos">
        <p>
          Únicamente para que la app funcione: mostrarte tus pedidos, calcular
          tu ganancia y armar los mensajes de WhatsApp que vos decidís
          mandar. No los usamos para nada más.
        </p>
      </Section>

      <Section title="Quién puede verlos">
        <p>
          Solo vos. Cada cuenta ve únicamente sus propias clientas, pedidos y
          marcas — ninguna otra cuenta puede acceder a tus datos, ni nosotros
          los miramos salvo que nos pidas ayuda con un problema puntual.
        </p>
      </Section>

      <Section title="Si los vendemos o compartimos">
        <p>No. No vendemos ni compartimos tus datos con nadie.</p>
      </Section>

      <Section title="Cómo pedir que borremos tu cuenta">
        <p>
          Escribinos por WhatsApp desde el pie de esta página y te borramos
          la cuenta junto con todos sus datos.
        </p>
      </Section>

      <Link href="/" className="text-sm font-semibold text-accent">
        ← Volver al inicio
      </Link>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-[18px] font-bold">{title}</h2>
      <div className="flex flex-col gap-1 text-[15px] text-ink">{children}</div>
    </section>
  );
}
