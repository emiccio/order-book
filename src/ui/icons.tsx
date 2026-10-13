/**
 * Iconos de línea del tab bar, copiados tal cual de docs/prototipo.html
 * (stroke-width 1.8, viewBox 24, trazo redondeado). Van siempre al lado de
 * un label visible, así que aria-hidden en todos: el nombre accesible lo da
 * el texto, no el glifo.
 */
function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export function ResumenIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <path d="M4 19V10M10 19V5M16 19v-6M22 19H2" />
    </Icon>
  );
}

export function OrdersIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </Icon>
  );
}

export function CustomersIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2" />
    </Icon>
  );
}

export function SettingsIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </Icon>
  );
}

export function CloseIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

// Los siguientes cuatro son para la landing (sección "el problema"): mismo
// trazo que el resto, pero no van al lado de texto en todos los casos, así
// que cada uso decide si hace falta un aria-label propio.

/** Pedidos desparramados: notas superpuestas, sin orden. */
export function ScatteredIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="8" height="10" rx="1.5" transform="rotate(-10 7 8)" />
      <rect x="9.5" y="9" width="8" height="10" rx="1.5" transform="rotate(8 13.5 14)" />
      <rect x="13" y="2.5" width="8" height="10" rx="1.5" transform="rotate(-6 17 7.5)" />
    </Icon>
  );
}

/** Quién debe cuánto: un signo de pregunta, como una duda pendiente. */
export function DebtQuestionIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.6 2.6 0 1 1 3.6 2.4c-.9.4-1.6 1-1.6 2.3" />
      <circle cx="12" cy="17.3" r="0.65" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Ganancia a ojo: las mismas barras del ícono de Resumen, pero punteadas. */
export function BlurryBarsIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <path d="M4 19V10M10 19V5M16 19v-6" strokeDasharray="1.5 3.2" />
      <path d="M22 19H2" />
    </Icon>
  );
}

/** Cobrar incomoda: un mensaje con un signo de exclamación. */
export function AwkwardChatIcon(props: { className?: string }) {
  return (
    <Icon {...props}>
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v10a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 3.5V17H4.5A1.5 1.5 0 0 1 3 15.5z" />
      <path d="M12 8.5v4" />
      <circle cx="12" cy="15" r="0.65" fill="currentColor" stroke="none" />
    </Icon>
  );
}
