# Sistema de diseño — Libreta de Ventas

Fuente de verdad visual: `docs/prototipo.html`. Este documento resume sus decisiones. Ante cualquier duda, se copia lo que hace el prototipo; no se inventan estilos nuevos.

## Carácter
Una libreta de trabajo: cálida, ordenada y tranquila. Fondo lila muy claro, superficies blancas, un único acento ciruela. Los números son los protagonistas; la decoración es mínima. Nada de gradientes, glassmorphism, sombras pesadas, emojis como íconos ni tarjetas con borde de color a un costado.

## Colores (tokens)
Se definen como variables CSS y se mapean en Tailwind con los mismos nombres. Ningún componente usa un color literal.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg` | `#F6F4F8` | `#15121A` | Fondo de la página |
| `surface` | `#FFFFFF` | `#211D28` | Tarjetas, listas, inputs, barra inferior |
| `sunk` | `#EFEBF3` | `#1B1821` | Hover de filas, chips neutros |
| `ink` | `#1F1A26` | `#F2EEF6` | Texto principal |
| `muted` | `#6B6375` | `#A79FB2` | Texto secundario, etiquetas |
| `line` | `#E3DEE9` | `#353040` | Bordes y separadores |
| `accent` | `#A3245C` | `#EE73A8` | Botón principal, tab activa, tarjeta destacada |
| `accent-ink` | `#FFFFFF` | `#2B0D1B` | Texto sobre `accent` |
| `accent-soft` | `#F7E4ED` | `#3B2030` | Avatares, fondos suaves de acento |
| `ok` / `ok-soft` | `#1F7A4D` / `#E2F3E9` | `#62CC95` / `#17321F` | Pagado, al día, WhatsApp |
| `warn` / `warn-soft` | `#9A5606` / `#FBEBD3` | `#F1B45E` / `#382912` | Debe, pendiente, avisos |
| `danger` / `danger-soft` | `#B42318` / `#FDE7E4` | `#F97066` / `#3A1916` | Borrar, errores |

Sombra única: `0 10px 30px rgba(40,20,50,.14)` (oscuro: `rgba(0,0,0,.5)`), solo para el botón flotante, hojas inferiores y toasts. El modo oscuro sigue `prefers-color-scheme`.

## Tipografía
- **Display:** Bricolage Grotesque 600/700/800. Solo marca, títulos de sección, títulos de hojas y números grandes.
- **Texto:** Figtree 400/500/600/700. Todo lo demás.
- Cargar con `next/font/google`.
- Escala: cuerpo 15px/1.45 · secundario 13px · etiquetas 11–12px en mayúsculas con `letter-spacing: .05–.06em` · títulos de sección 19px 700 · número de tarjeta 23px 700 · marca 21px 800.
- Todos los montos con `font-variant-numeric: tabular-nums`. Formato `$ 12.500`, sin decimales.

## Forma y espacio
- Radios: tarjetas y listas 14px · inputs 10px · ítems y cajas internas 12px · botones, chips y selector de ciclo: píldora (999px) · hojas inferiores 20px arriba.
- Bordes de 1px en `line`. Las tarjetas se separan por borde, no por sombra.
- Contenedor de la app: ancho máximo 560px centrado, margen lateral 16px.
- Espaciado entre bloques con `gap`, no con márgenes sueltos.

## Componentes (copiar del prototipo)
- **Encabezado fijo:** marca "Libreta de Ventas" en display + subtítulo en mayúsculas pequeñas; a la derecha el selector de ciclo como píldora.
- **Tarjetas de números:** grilla de 2 columnas. Etiqueta arriba en mayúsculas `muted`, número grande en display. "Tu ganancia" (o "Resultado") va destacada con fondo `accent`.
- **Listas:** un contenedor `surface` con borde y radio 14px; filas separadas por una línea. Fila = avatar con iniciales (círculo 36px en `accent-soft`) + nombre en negrita + detalle en `muted` + monto y chip a la derecha. El texto largo se corta con "…".
- **Chips de estado:** píldoras de 12px 600. `ok-soft` para Pagado o Al día, `warn-soft` para Debe, `sunk` para estados neutros como Sin entregar. Siempre con texto, no solo color.
- **Botones:** píldoras. Primario en `accent`; secundario en `surface` con borde; fantasma con texto `accent`; peligro en `danger-soft`; WhatsApp en `ok-soft`.
- **"+ Nuevo pedido":** botón flotante abajo a la derecha, sobre la barra de pestañas, con la sombra única.
- **Navegación:** barra inferior fija con 4 pestañas (Resumen, Pedidos, Clientas, Ajustes): ícono de línea de 22px + etiqueta de 12px. La activa en `accent`.
- **Formularios:** hojas que suben desde abajo (bottom sheet), con encabezado, cuerpo con scroll y pie fijo con las acciones. Etiquetas en mayúsculas 12px `muted`. Inputs con borde y radio 10px.
- **Estados vacíos:** caja con borde punteado y texto `muted` centrado que dice qué hacer.
- **Avisos breves (toast):** píldora oscura abajo al centro que desaparece sola.
- **Foco visible:** contorno de 2px en `accent` en todo elemento interactivo.

## Movimiento
Solo la entrada de las hojas inferiores (0,22s, desplazamiento corto) y transiciones de hover. Respetar `prefers-reduced-motion`.

## Landing pública
Misma paleta y tipografías. Puede tener más aire y títulos más grandes (display 800), pero sin gradientes ni ilustraciones genéricas. La pieza principal es una vista real de la app (la pantalla de resumen con datos de ejemplo).
