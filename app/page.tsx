import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney } from "@/domain/money";
import { whatsappUrl } from "@/domain/whatsapp";
import { buttonClasses } from "@/ui/Button";
import { Tile } from "@/ui/Tile";
import { Chip } from "@/ui/Chip";
import { Avatar } from "@/ui/Avatar";
import {
  ScatteredIcon,
  DebtQuestionIcon,
  BlurryBarsIcon,
  AwkwardChatIcon,
} from "@/ui/icons";

const TITLE = "Libreta de Ventas";
const DESCRIPTION =
  "Cargá tus pedidos, anotá los pagos y mirá tu ganancia de cada ciclo, todo desde el celular. Para revendedoras por catálogo y emprendedoras.";

// Placeholder personal hasta que se defina un número comercial — ver
// conversación de diseño de la landing.
const CONTACT_WHATSAPP = "2236146209";
const CONTACT_WHATSAPP_URL = whatsappUrl(
  CONTACT_WHATSAPP,
  "¡Hola! Tengo una consulta sobre Libreta de Ventas.",
);

const SIGNUP_HREF = "/app/login?mode=signup";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Audience />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}

/**
 * Link discreto para quien ya tiene cuenta — sin esto quedaba solo en el
 * pie, y obligaba a bajar toda la página para entrar.
 */
function TopBar() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 pt-5 lg:px-10 lg:pt-7">
      <span className="font-display text-sm font-extrabold">Libreta de Ventas</span>
      <Link href="/app/login" className="text-sm font-semibold text-accent">
        Iniciar sesión
      </Link>
    </div>
  );
}

function Hero() {
  return (
    <>
      <TopBar />
      <section className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-6 px-6 pb-10 pt-6 text-center sm:gap-7 sm:pb-16 sm:pt-8 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:pb-24 lg:pt-12 lg:text-left">
      <div className="flex flex-col items-center gap-5 lg:w-[52%] lg:items-start">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          Para revendedoras y emprendedoras
        </span>
        <h1 className="text-balance font-display text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-[36px] lg:text-[46px]">
          Sabé quién te debe y cuánto ganaste, sin cuaderno
        </h1>
        <p className="max-w-[46ch] text-[15px] text-muted sm:text-[17px]">
          Cargá tus pedidos, anotá los pagos y mirá tu ganancia de cada
          ciclo, todo desde el celular.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <Link href={SIGNUP_HREF} className={buttonClasses("primary")}>
            Crear mi libreta gratis
          </Link>
          <a href="#como-funciona" className={buttonClasses("secondary")}>
            Ver cómo funciona
          </a>
        </div>
      </div>

      <div className="mt-2 flex w-full justify-center lg:mt-0 lg:w-[48%]">
        <ResumenMockup />
      </div>
      </section>
    </>
  );
}

/**
 * La pantalla de Resumen armada con los mismos componentes de la app
 * (Tile, Chip, Avatar) y datos de ejemplo fijos — no una captura ni una
 * imagen inventada.
 */
function ResumenMockup() {
  const debtors = [
    { name: "Sofía Ruiz", amount: 14200 },
    { name: "Marta Díaz", amount: 8300 },
  ];

  return (
    <div
      className="w-full max-w-[300px] rounded-[2.5rem] border border-line bg-surface p-2.5 shadow-float sm:max-w-[320px]"
      aria-hidden="true"
    >
      <div className="rounded-[2rem] bg-bg px-4 pb-5 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-sm font-extrabold leading-none">
            Libreta de Ventas
          </div>
          <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold">
            Ciclo 14
          </span>
        </div>

        <div className="mb-2 font-display text-[15px] font-bold">Resumen</div>

        <div className="grid grid-cols-2 gap-2">
          <Tile size="sm" label="Vendido" value={formatMoney(84300)} />
          <Tile size="sm" label="Cobrado" value={formatMoney(61800)} />
          <Tile size="sm" label="A cobrar" value={formatMoney(22500)} />
          <Tile size="sm" label="Ganancia" value={formatMoney(31200)} highlight />
        </div>

        <p className="mt-2 px-0.5 text-[11px] text-muted">6 pedidos · 2 sin entregar</p>

        <div className="mt-3 text-[13px] font-bold text-ink">Quién te debe</div>
        <div className="mt-1.5 overflow-hidden rounded-xl border border-line bg-surface">
          {debtors.map((debtor, index) => (
            <div
              key={debtor.name}
              className={`flex items-center gap-2 px-2.5 py-2 ${index > 0 ? "border-t border-line" : ""}`}
            >
              <Avatar name={debtor.name} />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-[12px] font-semibold">{debtor.name}</div>
              </div>
              <Chip tone="warn">Debe {formatMoney(debtor.amount)}</Chip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PROBLEMS = [
  {
    Icon: ScatteredIcon,
    title: "Pedidos desparramados",
    text: "Entre el cuaderno, WhatsApp y la memoria, se te escapa quién pidió qué.",
  },
  {
    Icon: DebtQuestionIcon,
    title: "Quién debe cuánto",
    text: "Pagos parciales, medio pago, un “después te pago” — y perdés la cuenta.",
  },
  {
    Icon: BlurryBarsIcon,
    title: "Ganancia a ojo",
    text: "Vendiste un montón, pero no sabés cuánto es tuyo después de pagarle a la marca.",
  },
  {
    Icon: AwkwardChatIcon,
    title: "Cobrar incomoda",
    text: "Escribir “che, me debés” de cero, cada vez, a cada clienta.",
  },
];

function Problem() {
  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 py-14 lg:px-10 lg:py-20">
      <h2 className="mx-auto max-w-[32ch] text-balance text-center font-display text-[24px] font-bold sm:text-[28px]">
        Si vendés por catálogo, ya conocés estos quilombos
      </h2>
      <div className="mx-auto mt-8 grid max-w-[900px] grid-cols-1 gap-3 sm:grid-cols-2">
        {PROBLEMS.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-card border border-line bg-surface p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon />
            </div>
            <div>
              <div className="font-semibold">{title}</div>
              <p className="mt-0.5 text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Cargás el pedido",
    text: "Clienta, productos y precio. Un par de toques.",
  },
  {
    title: "Registrás los pagos",
    text: "Parciales o completos, a medida que entran.",
  },
  {
    title: "Cerrás el ciclo sabiendo cuánto ganaste",
    text: "Con tu ganancia ya calculada, no a ojo.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-surface px-6 py-14 lg:py-20">
      <div className="mx-auto w-full max-w-[1100px] lg:px-4">
        <h2 className="text-center font-display text-[24px] font-bold sm:text-[28px]">
          En 3 pasos
        </h2>
        <div className="mx-auto mt-8 grid max-w-[900px] grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center gap-2.5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-solid font-display text-[17px] font-bold text-accent-ink">
                {index + 1}
              </div>
              <div className="font-semibold">{step.title}</div>
              <p className="max-w-[28ch] text-sm text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 py-14 lg:px-10 lg:py-20">
      <h2 className="text-center font-display text-[24px] font-bold sm:text-[28px]">
        Qué podés hacer
      </h2>
      <div className="mx-auto mt-8 grid max-w-[1000px] grid-cols-1 gap-4 sm:grid-cols-2">
        <FeatureCard title="Pedidos por ciclo" text="Organizás por “Ciclo 14”, “Octubre” o como vendas vos.">
          <div className="overflow-hidden rounded-xl border border-line bg-bg">
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar name="Laura Gómez" />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-[13px] font-semibold">Laura Gómez</div>
                <div className="truncate text-[11px] text-muted">Perfume Kaiak, Crema Ekos</div>
              </div>
              <span className="num shrink-0 text-[13px] font-semibold">{formatMoney(63900)}</span>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard title="Quién te debe" text="Lista ordenada por lo que te deben, con un toque para recordarles.">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-bg px-3 py-2.5">
            <div className="text-left">
              <div className="text-[13px] font-semibold">Sofía Ruiz</div>
              <div className="num text-[12px] font-semibold text-warn">Debe {formatMoney(14200)}</div>
            </div>
            <span className={`shrink-0 ${buttonClasses("wa", "sm")}`}>Recordar</span>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Ganancia por marca o por producto"
          text="Cargás el % de cada marca, o el costo si el producto es tuyo."
        >
          <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-bg px-3 py-2.5 text-[13px]">
            <span className="font-medium">Natura · 30% de ganancia</span>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Recordatorio por WhatsApp"
          text="El mensaje ya armado, un toque y se lo mandás."
        >
          <div className="rounded-xl border border-line bg-bg px-3 py-2.5 text-left text-[12px] text-muted">
            “¡Hola Sofía! Te quedan {formatMoney(14200)} pendientes…”
          </div>
        </FeatureCard>

        <FeatureCard
          title="Gastos y resultado"
          text="Envío, packaging, publicidad: tu ganancia real, después de gastos."
        >
          <div className="num flex flex-col gap-1 rounded-xl border border-line bg-bg px-3 py-2.5 text-[13px]">
            <div className="flex justify-between text-muted">
              <span>Gastos</span>
              <span>{formatMoney(4800)}</span>
            </div>
            <div className="flex justify-between font-bold text-ink">
              <span>Resultado</span>
              <span>{formatMoney(26400)}</span>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Sabés qué entregaste y qué te pagaron"
          text="Que te deba no significa que no le entregaste, y al revés: son dos cosas separadas."
        >
          <div className="flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5">
            <Chip tone="ok">Entregado</Chip>
            <Chip tone="warn">Debe {formatMoney(8300)}</Chip>
          </div>
        </FeatureCard>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <div>
        <div className="font-semibold">{title}</div>
        <p className="mt-0.5 text-sm text-muted">{text}</p>
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function Audience() {
  return (
    <section className="bg-surface px-6 py-14 lg:py-20">
      <div className="mx-auto w-full max-w-[1100px] lg:px-4">
        <h2 className="text-center font-display text-[24px] font-bold sm:text-[28px]">
          Dos formas de vender, una sola libreta
        </h2>
        <div className="mx-auto mt-8 grid max-w-[900px] grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-bg p-5">
            <div className="font-display text-[17px] font-bold">Revendedoras por catálogo</div>
            <p className="mt-1.5 text-sm text-muted">
              Natura, Avon, o las que vendas. Cargás el % de ganancia de cada
              marca una sola vez, y listo.
            </p>
          </div>
          <div className="rounded-card border border-line bg-bg p-5">
            <div className="font-display text-[17px] font-bold">Emprendedoras</div>
            <p className="mt-1.5 text-sm text-muted">
              Tus propios productos. Cargás el costo de cada uno y la
              libreta calcula tu ganancia real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "¿Tengo que instalar algo?",
    a: "No. Entrás desde el navegador. Si querés, la podés agregar a la pantalla de inicio como una app más — en Android te lo ofrece solo, en iPhone tocás Compartir → Agregar a pantalla de inicio.",
  },
  {
    q: "¿Funciona en el celular y en la PC?",
    a: "Sí, las dos. Pensada primero para el celular, pero anda igual de bien en la computadora.",
  },
  {
    q: "¿Mis datos son privados?",
    a: "Sí. Son tuyos, de nadie más — ninguna otra cuenta puede verlos.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Gratis por ahora. Si el día de mañana hay un plan pago, te avisamos antes.",
  },
  {
    q: "¿Sirve si vendo varias marcas?",
    a: "Sí, cargás cada una con su propio porcentaje y la libreta las suma por separado.",
  },
  {
    q: "¿Necesito internet?",
    a: "Sí, para guardar y ver tus datos. No guarda nada sin conexión.",
  },
];

function Faq() {
  return (
    <section className="mx-auto w-full max-w-[720px] px-6 py-14 lg:py-20">
      <h2 className="text-center font-display text-[24px] font-bold sm:text-[28px]">
        Preguntas frecuentes
      </h2>
      <div className="mt-8 flex flex-col gap-2.5">
        {FAQS.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-card border border-line bg-surface px-4 py-3 open:pb-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold marker:content-none">
              {faq.q}
              <span
                aria-hidden="true"
                className="shrink-0 text-xl leading-none text-muted group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="hidden shrink-0 text-xl leading-none text-muted group-open:block"
              >
                −
              </span>
            </summary>
            <p className="mt-2 text-sm text-muted">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-accent-solid px-6 py-14 text-center text-accent-ink lg:py-20">
      <h2 className="mx-auto max-w-[26ch] text-balance font-display text-[24px] font-bold sm:text-[30px]">
        Dejá de llevar la cuenta en la cabeza
      </h2>
      <Link
        href={SIGNUP_HREF}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-surface px-6 text-[15px] font-semibold text-ink"
      >
        Crear mi libreta gratis
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-10 text-center text-sm text-muted">
      <div className="font-display font-bold text-ink">{TITLE}</div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <a
          href={CONTACT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent"
        >
          WhatsApp
        </a>
        <Link href="/app/login" className="font-semibold text-accent">
          Iniciar sesión
        </Link>
        <Link href="/privacidad" className="font-semibold text-accent">
          Privacidad
        </Link>
      </div>
    </footer>
  );
}
