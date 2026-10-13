"use client";

import { usePathname } from "next/navigation";
import { ResumenIcon, OrdersIcon, CustomersIcon, SettingsIcon } from "@/ui/icons";

const TABS = [
  { href: "/app", label: "Resumen", Icon: ResumenIcon },
  { href: "/app/orders", label: "Pedidos", Icon: OrdersIcon },
  { href: "/app/customers", label: "Clientas", Icon: CustomersIcon },
  { href: "/app/settings", label: "Ajustes", Icon: SettingsIcon },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 flex justify-center border-t border-line bg-surface px-2 pb-[calc(6px+env(safe-area-inset-bottom,0px))] pt-1.5"
    >
      <div className="grid w-full max-w-[560px] grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const isActive = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
          return (
            // <a> plano a propósito: cada pestaña trae datos que cambian
            // seguido (ciclo activo, pedidos, saldos); con next/link la
            // caché de navegación del cliente puede mostrar una versión
            // vieja hasta que expire por su cuenta.
            <a
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-xs font-semibold ${
                isActive ? "text-accent" : "text-muted"
              }`}
            >
              <Icon />
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
