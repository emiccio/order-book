# Libreta de Ventas

WebApp mobile-first (instalable como PWA) para revendedoras por catálogo y emprendedoras.
Flujo central: Clienta → Pedido → Pago → Entrega → Saldo → Ganancia → Cierre de ciclo.

## Documentos
- `docs/roadmap.md`: especificación del producto (V1 a V4) y criterio de terminado de la V1. Leelo antes de planificar cualquier cambio de producto.
- `docs/prototipo.html`: prototipo funcional de un solo archivo. Es referencia de UX, textos y cálculos, no código para copiar tal cual. Usa `window.claude` (persistencia propia de los artifacts de Claude), que no existe fuera de ese entorno: ignorar esa parte.
- `docs/plan-v1.md`: plan de implementación aprobado (se crea en la primera sesión).

## Alcance
- IMPORTANT: construir solo la V1. No avanzar a V2, V3 o V4 hasta que la V1 sea usable con datos reales.
- WhatsApp es solo un canal: links `wa.me` con el mensaje armado. Sin bot, webhooks, lectura de mensajes ni IA.
- No construir inventario, facturación, contabilidad ni CRM.
- Gastos simples (envío, packaging, publicidad, comisión, otros) sí entran en la V1.

## Reglas de dominio
- El estado de entrega es independiente del estado de pago. Estados de entrega: pendiente de recibir, recibido, pendiente de entregar, entregado, cancelado.
- Mantener separados: total vendido, total cobrado, pendiente de cobro, costo de productos (lo que se le paga a la marca), ganancia de productos, gastos y resultado después de gastos. Nunca asumir vendido = cobrado ni ganancia = plata disponible.
- Costo de un producto: si tiene costo propio cargado se usa ese; si no, precio × (1 − % de ganancia de su marca).
- No permitir pagos mayores al saldo del pedido, pedidos sin clienta o sin productos, ni cantidades, precios o gastos inválidos.
- Plata en pesos argentinos, sin decimales en pantalla, formato `$ 12.500`.

## Interfaz
- Textos en español rioplatense, tuteo con "vos" ("Cargá", "Tenés").
- Prioridad: teléfono, después tablet, después desktop.
- El botón "+ Nuevo pedido" siempre visible. Crear un pedido con la menor cantidad de pasos posible.

## Idioma
- Código en inglés: rutas, funciones, variables, tablas y columnas, valores de enums, archivos, carpetas, componentes y descripciones de tests.
- Interfaz en castellano rioplatense con "vos": etiquetas, botones, estados vacíos, mensajes de error, mensajes de WhatsApp y textos de la landing.
- Los enums se traducen en un solo lugar: `src/ui/labels.ts`. Por ejemplo `pending_delivery` se muestra como "Pendiente de entregar".

## Arquitectura
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4. Landing pública en `/`, app privada en `/app`.
- Supabase: Postgres con Row Level Security por `user_id`, y Supabase Auth con email y contraseña (sesión en cookies, vía `@supabase/ssr`). No programar autenticación a mano.
- Lectura de datos en Server Components; escritura en Server Actions con `revalidatePath`. Sin librería de datos del lado del navegador.
- Separar entidades, cálculos, persistencia y UI, sin abstracciones de más: `src/domain/` (tipos, cálculos, validaciones) no importa nada de `src/data/`, `src/actions/` ni `src/ui/`.
- Los cálculos son funciones puras con tests, en `src/domain/calculations.ts`. Las validaciones de Zod viven en `src/domain/validations.ts` y las usan tanto los formularios como las Server Actions.
- La app requiere conexión. PWA instalable con manifest estático declarado solo en el layout de `/app`, y service worker (`@serwist/next`) que cachea únicamente archivos estáticos, nunca navegaciones ni datos.
- El login vive en `/app/login`, dentro del alcance del manifest, para que la app instalada no mande a la usuaria al navegador cuando se le vence la sesión.

## Comandos
- Instalar: `npm install`
- Desarrollo: `npm run dev`
- Tests: `npm test` · de punta a punta: `npx playwright test`
- Tipos y lint: `npx tsc --noEmit` · `npm run lint`
- Build: `npm run build`
- Base de datos: migraciones SQL versionadas en `supabase/migrations/`

## Forma de trabajo
- Cambios chicos y revisables. Antes de un cambio grande de arquitectura, explicar por qué y esperar aprobación.
- Antes de dar algo por terminado: correr los tests y el build, y mostrar el resultado.
- Al cerrar cada bloque: qué cambió, archivos modificados, riesgos y cómo probarlo a mano desde el celular.
