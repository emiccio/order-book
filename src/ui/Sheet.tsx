"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/ui/icons";

// Todo el contenido de la app vive bajo este id (ver app/app/(shell)/layout.tsx).
// Mientras hay un sheet abierto se oculta de verdad (display:none), no solo
// con inert/aria-hidden: esos dos no alcanzan para sacarlo de las consultas
// por accesibilidad (p. ej. un campo "Marca" en Ajustes y el "Marca" del
// sheet de "+ Nuevo pedido" quedan como dos elementos con el mismo nombre
// accesible a la vez). display:none sí lo saca del todo.
const APP_ROOT_ID = "app-shell-root";

export function Sheet({
  open,
  title,
  onClose,
  footer,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const appRoot = document.getElementById(APP_ROOT_ID);
    appRoot?.setAttribute("inert", "");
    if (appRoot) appRoot.style.display = "none";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      appRoot?.removeAttribute("inert");
      if (appRoot) appRoot.style.display = "";
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/45" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-anim flex max-h-[92%] w-full max-w-[560px] flex-col overflow-hidden rounded-t-sheet bg-bg shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
          <h3 id={titleId} className="font-display text-[19px] font-bold">
            {title}
          </h3>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted hover:bg-sunk"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="flex justify-between gap-2 border-t border-line bg-surface p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
