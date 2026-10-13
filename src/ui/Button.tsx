import type { ButtonHTMLAttributes } from "react";

const VARIANT_CLASSES = {
  primary: "border border-accent-solid bg-accent-solid text-accent-ink hover:brightness-[1.06]",
  secondary: "border border-line bg-surface hover:border-muted",
  ghost: "border border-transparent bg-transparent text-accent",
  danger: "border border-transparent bg-danger-soft text-danger",
  wa: "border border-transparent bg-ok-soft text-ok",
} as const;

// min-h-11 (44px) en todos los tamaños, el mínimo del checklist de touch
// targets — el prototipo tenía .btn.small de ~24px de alto ("Editar",
// "Archivar", "Borrar" como texto desnudo), que quedaba chico para el dedo.
const SIZE_CLASSES = {
  md: "min-h-11 px-4 text-[15px] font-semibold",
  sm: "min-h-11 px-3.5 text-sm font-semibold",
} as const;

type Variant = keyof typeof VARIANT_CLASSES;
type Size = keyof typeof SIZE_CLASSES;

/**
 * Mismas clases que <Button>, para un <a> que tiene que verse como botón
 * (p. ej. "Recordar" por WhatsApp o "Compartir por WhatsApp": son links de
 * verdad — abren wa.me en una pestaña nueva — y tienen que seguir siendo
 * <a href> para que el rol accesible sea "link", no "button").
 */
export function buttonClasses(variant: Variant = "secondary", size: Size = "md", fullWidth?: boolean): string {
  return `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : "self-start"}`;
}

export function Button({
  variant = "secondary",
  size = "md",
  fullWidth,
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={rest.type ?? "button"}
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : "self-start"} ${className}`}
    >
      {children}
    </button>
  );
}
