# Plan V1 — Libreta de Ventas

## Contexto

El repositorio hoy tiene solo documentación: `CLAUDE.md` (reglas de dominio y de trabajo), `docs/roadmap.md` (especificación de producto V1 a V4) y `docs/prototipo.html` (prototipo funcional de un solo archivo, que sirve como referencia de UX, textos y cálculos). No hay código de aplicación.

El objetivo es construir la V1: una WebApp mobile-first instalable como PWA que resuelva el flujo `Clienta → Pedido → Pago → Entrega → Saldo → Ganancia → Cierre de ciclo`, para probarla con 10 a 20 personas reales. Cada persona necesita su propia cuenta y ver los mismos datos desde el celular y desde la PC. Además hace falta una landing pública que presente el producto, para poder invitar a esas personas con un link que explique de qué se trata antes de pedirles que se registren.

El prototipo ya resuelve bien varias cosas que vamos a conservar: la paleta y tipografías, la estructura de navegación (header con selector de ciclo, cuatro pestañas abajo, botón "+ Nuevo pedido" fijo, hojas inferiores para editar), los textos en rioplatense, el formato de plata, los mensajes de WhatsApp y la fórmula de costo por producto. Lo que le falta para ser V1: cuentas de usuario con datos sincronizados, los cinco estados de entrega (hoy tiene un solo booleano "entregado"), gastos, cierre de ciclo, y validaciones reales (hoy se puede registrar un pago mayor al saldo).

## Idioma: código en inglés, interfaz en castellano

Todo lo que es código va en inglés: rutas, nombres de funciones y variables, tablas y columnas de la base, valores de los enums, archivos, carpetas, componentes y descripciones de los tests.

Todo lo que lee una persona usando el producto va en castellano rioplatense con "vos", como ya pide `CLAUDE.md`: etiquetas, botones, estados vacíos, mensajes de error, los mensajes de WhatsApp y los textos de la landing.

En la práctica: el campo que dice "Clienta" en pantalla se guarda en la tabla `customers`, y el estado que se muestra como "Pendiente de entregar" se guarda como `pending_delivery`. Hay un solo lugar donde se cruzan los dos idiomas: un diccionario de etiquetas por estado y por categoría, en `src/ui/labels.ts`.

## Lo que entendí del alcance de la V1

Una libreta digital para revendedoras por catálogo y emprendedoras. Registra ventas, cobros y entregas, y cierra el ciclo mostrando cuánto se vendió y cuánto se ganó de verdad.

Cuatro ideas gobiernan el diseño:

1. **Entrega y pago son cosas separadas.** "Ya lo recibió" no es "ya lo pagó". Se modelan y se muestran por separado.
2. **Nunca confundir plata vendida con plata cobrada ni con plata disponible.** Siete números se mantienen distintos: vendido, cobrado, pendiente de cobro, costo de productos, ganancia de productos, gastos, resultado después de gastos.
3. **Costo del producto:** si el producto tiene costo propio cargado, se usa ese; si no, `precio × (1 − % de ganancia de la marca)`.
4. **Alcance cerrado.** Sin inventario, facturación, contabilidad ni CRM. WhatsApp es solo un link `wa.me` con el mensaje ya armado: nada de bots, webhooks ni IA.

Fuera de V1: catálogo de productos (en V1 el producto se escribe a mano en el pedido), recordatorios automáticos, alertas, analítica.

## Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Un solo repo con front y back, deploy en Vercel sin configurar nada, y la landing pública conviviendo con la app privada |
| Estilos | Tailwind CSS v4 con los tokens del prototipo (`--accent`, `--ink`, etc.) | Conserva la identidad visual ya definida; modo oscuro sale casi gratis |
| Base de datos | Supabase Postgres con Row Level Security | Una regla por tabla y cada usuaria solo ve lo suyo, garantizado por la base |
| Autenticación | Supabase Auth, email y contraseña, sesión en cookies vía `@supabase/ssr` | Registro, login, recuperación de contraseña y refresco de token ya resueltos |
| Lectura de datos | Server Components que llaman a la capa de repositorios | La pantalla llega del servidor ya con los números puestos: nada de pantallas en blanco con spinner en un celular con mala señal |
| Escritura de datos | Server Actions + `revalidatePath` | El formulario llama a una función del servidor; al terminar, la pantalla se refresca sola |
| Formularios | `react-hook-form` + Zod en la hoja de pedido; Server Actions para guardar | La hoja de pedido necesita calcular total y ganancia mientras escribís: eso es cálculo local, sin servidor |
| PWA | Manifest en `public/` + service worker con `@serwist/next` | Ver la sección de PWA |
| Tests | Vitest (unitarios), React Testing Library (componentes de cliente), Playwright (punta a punta) | Playwright ya está instalado en tu entorno |
| Deploy | Vercel, despliegue automático en cada push a `main` | Un link HTTPS desde el primer día, que es lo que hace falta para probar en el celular |

### Pros y contras, en breve

**Next.js App Router**

- A favor: un solo proyecto, un solo deploy, y la landing pública y la app privada comparten estilos y componentes. La página llega del servidor ya armada, así que en un celular con señal pobre no ves spinners. Como hay servidor, la clave de Supabase con permisos elevados nunca sale al navegador si algún día hace falta.
- En contra: más conceptos que aprender (qué corre en el servidor y qué en el navegador, cuándo se revalida una ruta). Y los Server Components no se pueden testear con React Testing Library, así que esa parte se cubre con Playwright, que es más lento.

**Supabase (Postgres + Auth + RLS)**

- A favor: Postgres de verdad, autenticación incluida con recuperación de contraseña, y Row Level Security que da el aislamiento por usuaria casi gratis. El plan gratuito alcanza de sobra para 20 personas.
- En contra: dependés de un servicio externo y hay que aprender su modelo de permisos. El plan gratis pausa proyectos sin uso después de una semana (se reactivan solos al entrar, pero la primera carga tarda unos segundos).

**Server Actions en lugar de datos en el navegador**

- A favor: menos librerías, menos estado duplicado, y la validación corre del lado del servidor, que es el único lugar donde la validación realmente protege los datos.
- En contra: cada guardado es un viaje al servidor. Hay que mostrar bien el estado "guardando" (con `useTransition` y `useFormStatus`) para que en un celular lento no parezca que la app se colgó.

### Por qué backend desde el principio

El requisito de "cada una con su cuenta, y sus datos en el celular y en la PC" ya decide la discusión: eso es, por definición, datos en un servidor.

Lo que hacemos para no frenarnos: la **Etapa 1 corre sin backend** (datos de ejemplo en memoria) para tener algo instalable en el celular el primer día, y Supabase entra en la **Etapa 2**, antes de que haya una sola usuaria real.

**Sobre trabajar sin internet:** la app necesita conexión para cargar y guardar. El service worker cachea la cáscara de la app, así que sin señal abre y muestra un aviso claro en lugar del error del navegador, pero no se puede cargar un pedido sin internet. El "modo avión" completo es la parte más difícil de construir y la que más datos puede corromper; queda para V1.1 si las probadoras lo piden.

## Landing pública y app privada

```
app/
  layout.tsx                 raíz: fuentes, tokens de color, modo oscuro
  page.tsx                   /                 landing pública
  app/
    layout.tsx               /app/*            pestañas, selector de ciclo, botón "+ Nuevo pedido"
    page.tsx                 /app              Resumen
    orders/page.tsx          /app/orders       Pedidos
    customers/page.tsx       /app/customers    Clientas
    settings/page.tsx        /app/settings     Ajustes (marcas y ciclos)
    expenses/page.tsx        /app/expenses     Gastos
    cycles/[id]/page.tsx     /app/cycles/…     cierre y consulta de un ciclo
    login/page.tsx           /app/login        login y registro
middleware.ts                refresca la sesión y manda a /app/login si no hay
public/
  manifest.webmanifest
  icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
```

Las rutas quedan en inglés; lo que se lee en pantalla, en castellano: la pestaña `/app/customers` dice "Clientas".

El login vive en `/app/login`, **dentro** de `/app` y no en `/login`, por un motivo concreto de PWA: si estuviera afuera del alcance declarado en el manifest, cuando a la usuaria se le vence la sesión la app instalada la echaría a una pestaña del navegador en vez de resolverlo adentro.

La landing no lleva sesión ni consultas a la base: es una página estática, así que carga instantánea y se puede compartir por WhatsApp sin problemas.

## PWA con Next.js: cómo se resuelve y qué limita

**Manifest.** Un archivo estático en `public/manifest.webmanifest` con `name`, `short_name`, íconos de 192 y 512 píxeles (uno de ellos `maskable`, que es el que Android recorta en círculo), `display: "standalone"`, `start_url: "/app"` y `scope: "/app"`. Se declara con `metadata.manifest` **solamente en el layout de `/app`**, no en el layout raíz. Así el botón de instalar aparece cuando la persona está usando la app, no cuando está leyendo la landing. (Se usa un archivo estático en vez del `app/manifest.ts` de Next.js justamente porque ese archivo especial inyecta el link en todas las páginas, incluida la landing.)

Desde la landing, el botón "Entrar" lleva a `/app`, y ahí el navegador ofrece instalar.

**Service worker.** `@serwist/next`, que es el paquete mantenido que reemplazó a `next-pwa`. Configurado chico a propósito: precachea solo los archivos estáticos del build (JS, CSS, íconos, fuentes) y deja pasar directo a la red todo lo que sea navegación, datos de Supabase o payload de Server Components. Más una página de "sin conexión" para cuando no hay señal.

**iOS.** Además del manifest, los metadatos que Safari necesita: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` y `apple-touch-icon`.

### Limitaciones, sin maquillaje

1. **En iPhone no hay botón de instalar.** La usuaria tiene que entrar con Safari, tocar Compartir y elegir "Agregar a pantalla de inicio". No existe forma de que la app se lo ofrezca sola, así que en la landing va a haber una instrucción corta con ese paso para iPhone. En Android, Chrome sí ofrece instalar.
2. **El service worker no puede cachear las navegaciones.** Con Server Components, las navegaciones viajan como un payload especial; si el service worker lo cacheara, verías pantallas con números viejos. Por eso el cache se limita a archivos estáticos. Consecuencia: sin internet la app abre, pero no muestra datos.
3. **Después de un deploy, una app instalada puede quedar con la cáscara vieja.** Se mitiga con `skipWaiting` más `clientsClaim` (el service worker nuevo toma el control enseguida) y con que Vercel conserva los archivos de los deploys anteriores. Riesgo bajo, pero existe y conviene no desplegar en medio de una sesión de prueba con usuarias.
4. **La landing queda fuera del alcance de la app instalada.** Es a propósito: desde la app instalada, un link a `/` abre el navegador. Nadie va a querer volver a la landing desde la app, así que no es un problema real.
5. **Nada de escribir sin conexión** y nada de notificaciones push en V1.
6. **iOS borra el almacenamiento local después de unos días sin usar la app.** Como los datos viven en el servidor, lo único que pasa es que hay que volver a iniciar sesión.
7. **Que el botón de instalar aparezca hay que verificarlo en un teléfono real**, no en el navegador de la computadora. Es parte de la prueba manual de la Etapa 1, en un Android y en un iPhone.

## Modelo de datos

Un esquema de Postgres, con nombres en inglés. Todas las tablas llevan `user_id` y una regla de Row Level Security `user_id = auth.uid()`: cada usuaria solo ve y toca lo suyo, garantizado por la base, no por el código de la app.

**Plata:** se guarda como `numeric(14,2)` y se muestra redondeada sin decimales (`$ 12.500`). El decimal es necesario porque los costos calculados por porcentaje casi nunca dan números enteros; redondear al guardar iría acumulando centavos de error a lo largo de un ciclo.

```
profiles
  id               uuid  PK → auth.users.id
  name             text
  active_cycle_id  uuid  FK → cycles.id, nullable
  created_at       timestamptz

cycles
  id          uuid  PK
  user_id     uuid  FK → auth.users.id
  name        text              -- "Ciclo 14", "Octubre"
  status      text              -- 'open' | 'closed'
  closed_at   timestamptz  null
  created_at  timestamptz

brands
  id          uuid  PK
  user_id     uuid
  name        text              -- "Natura", "Mis velas"
  margin_pct  numeric(5,2)      -- ganancia sobre el precio de venta; 0 para productos propios
  archived    boolean           -- en vez de borrar: los pedidos viejos conservan su marca
  created_at  timestamptz

customers
  id          uuid  PK
  user_id     uuid
  name        text              -- obligatorio
  phone       text  null        -- se guarda como lo escribió; se normaliza al armar el link de WhatsApp
  notes       text  null
  archived    boolean
  created_at  timestamptz

orders
  id               uuid  PK
  user_id          uuid
  cycle_id         uuid  FK → cycles.id
  customer_id      uuid  FK → customers.id
  date             date
  delivery_status  text  -- 'pending_receipt' | 'received' | 'pending_delivery' | 'delivered' | 'cancelled'
  notes            text  null
  created_at       timestamptz

order_items
  id           uuid  PK
  user_id      uuid
  order_id     uuid  FK → orders.id  ON DELETE CASCADE
  name         text              -- texto libre: "Perfume Kaiak"
  brand_id     uuid  null        -- null = "Sin marca"
  quantity     numeric(10,2)     -- > 0
  unit_price   numeric(14,2)     -- >= 0
  unit_cost    numeric(14,2) null -- si está cargado manda sobre el % de la marca
  position     integer

payments
  id          uuid  PK
  user_id     uuid
  order_id    uuid  FK → orders.id  ON DELETE CASCADE
  date        date
  amount      numeric(14,2)     -- > 0, y la suma de pagos nunca supera el total del pedido
  note        text  null
  created_at  timestamptz

expenses
  id           uuid  PK
  user_id      uuid
  cycle_id     uuid  FK → cycles.id
  category     text              -- 'shipping' | 'packaging' | 'advertising' | 'commission' | 'other'
  description  text  null
  amount       numeric(14,2)     -- > 0
  date         date
  created_at   timestamptz
```

Los valores de los enums van en inglés y se traducen al mostrarlos, en `src/ui/labels.ts`: `pending_delivery` → "Pendiente de entregar", `shipping` → "Envío", y así.

### Decisiones del modelo que vale la pena explicar

- **El ciclo activo vive en `profiles`, no como una casilla en `cycles`.** Si fuera una casilla por ciclo, la base permitiría tener dos ciclos "actuales" a la vez. Con un solo campo apuntando al ciclo, eso es imposible por construcción.
- **La fila de `profiles` se crea sola al registrarse**, con un disparador (trigger) de Postgres sobre `auth.users`. Así no hay forma de que exista una cuenta sin perfil, ni siquiera si falla algo en el medio del registro.
- **El nombre del producto es texto libre dentro del pedido, no una tabla de productos.** Es lo que hace el prototipo y lo que el roadmap pide: el catálogo de productos frecuentes es V2. Esto mantiene la carga de un pedido en pocos toques.
- **Las marcas y las clientas se archivan, no se borran.** Borrar una marca cambiaría la ganancia de pedidos ya cerrados, y borrar una clienta haría desaparecer su historial de deuda. (El prototipo borra en cascada; para datos reales eso es peligroso.) Igual queda la opción de borrar de verdad una marca o clienta sin ningún pedido asociado.
- **El costo se guarda por ítem, no se recalcula desde la marca al mostrar.** Si en el futuro cambia el porcentaje de una marca, los pedidos ya cargados no cambian de ganancia retroactivamente.

### Cálculos (funciones puras, con tests)

Todas en `src/domain/calculations.ts`, sin tocar base ni UI:

```ts
itemCost(item, brand)          → item.unitCost ?? unitPrice × (1 − marginPct / 100)
calcOrder(order)               → { total, cost, profit, paid, balance }
calcCycle(orders, expenses)    → { sold, collected, outstanding, productCost,
                                   productProfit, expenses, result }
debtors(orders, customers)     → ordenado por balance, de mayor a menor
byBrand(orders, brands)        → por marca: { sold, payable, profit }
```

`payable` es el costo de los productos de esa marca: lo que le debés a la marca. La V1 no registra si ya se lo pagaste; lo muestra como número a pagar.

Los pedidos con `delivery_status = 'cancelled'` quedan afuera de todos los totales.

### Validaciones (una sola fuente, con tests)

En `src/domain/validations.ts` (con Zod), usadas por los formularios **y por las Server Actions**, y reforzadas con restricciones `CHECK` en la base. Tres capas, a propósito: el formulario avisa rápido, la Server Action es la que realmente decide, y la base es la red de seguridad. Los mensajes de error están en castellano, porque los lee la usuaria.

- Pedido sin clienta, o sin ningún ítem → rechazado.
- Cantidad ≤ 0, precio < 0, costo < 0 → rechazado.
- Pago ≤ 0 → rechazado. Pago que haría que lo pagado supere el total del pedido → rechazado, con el mensaje de cuánto es el saldo.
- Gasto ≤ 0, o sin categoría → rechazado.
- Pedido o gasto en un ciclo que no existe, o en un ciclo cerrado → rechazado.
- Nombre de clienta, marca o ciclo vacío → rechazado.

## Estructura de carpetas

```
app/                   rutas (ver arriba): landing, /app/*, middleware
src/
  domain/              types.ts, calculations.ts, validations.ts, money.ts, whatsapp.ts
  data/                supabase/{server,browser}.ts + un repositorio por entidad
  actions/             Server Actions: una por operación de escritura
  ui/                  componentes compartidos (Sheet, Card, Row, Chip, Button, MoneyInput)
                       y labels.ts: el único lugar donde los enums se vuelven castellano
  landing/             secciones de la landing
supabase/
  migrations/          el esquema SQL, versionado
middleware.ts          refresco de sesión y protección de /app
```

La regla que sostiene todo: `domain/` no importa nada de `data/`, `actions/` ni `ui/`. Así los cálculos se pueden testear solos y rápido, y una decisión de base de datos nunca obliga a tocar una pantalla.

## Etapas

Cada etapa termina en algo desplegado que podés abrir y probar desde el celular.

### Etapa 1 — Cáscara instalable

Proyecto Next.js + TypeScript + Tailwind con los tokens del prototipo. Las dos zonas de ruta ya separadas: una landing mínima de una pantalla en `/` y la app en `/app` con su layout propio (header con selector de ciclo, cuatro pestañas abajo, botón "+ Nuevo pedido" fijo). Las cuatro pantallas existen con estados vacíos y datos de ejemplo en memoria. Manifest, íconos, service worker y página de "sin conexión". Desplegado en Vercel.

Probás: abrís el link en el celular, vas a `/app`, la instalás desde el navegador, el ícono queda en el escritorio, abre en pantalla completa sin barra de direcciones, las pestañas navegan y el botón "atrás" del celular funciona. En iPhone, con Compartir → Agregar a pantalla de inicio. Con el celular en modo avión, la app abre y muestra el aviso de sin conexión.

Tests:
- `money.ts`: formatea `12500` como `$ 12.500`; redondea; maneja cero, negativos y nulos.
- `labels.ts`: cada valor de cada enum tiene su etiqueta en castellano (si mañana se agrega un estado, el test falla).
- Las cuatro pantallas renderizan sin error (React Testing Library sobre los componentes de cliente).
- El manifest existe y declara nombre, íconos, `display: standalone`, `start_url: /app` y `scope: /app`.
- Playwright: `/` responde sin sesión; `/app` existe y muestra la cáscara.

### Etapa 2 — Cuenta propia, marcas y ciclos

Proyecto de Supabase, esquema completo con RLS y el disparador que crea el perfil. Registro, login, cierre de sesión y recuperación de contraseña en `/app/login`, con `@supabase/ssr` y sesión en cookies. `middleware.ts` refresca el token y protege `/app`. Capa de repositorios y primeras Server Actions. Pantalla de Ajustes funcionando: crear, editar y archivar marcas con su porcentaje; crear ciclos y elegir el activo.

Probás: te registrás desde el celular, cargás "Natura 30%" y un ciclo "Octubre"; abrís la app en la PC con la misma cuenta y están ahí. Cerrás sesión y `/app` te manda a `/app/login`. Con otra cuenta, no se ve nada de la primera.

Tests:
- Aislamiento por usuaria: dos usuarias de prueba, cada una no puede leer ni escribir filas de la otra (test de integración contra Supabase; es el test más importante de esta etapa).
- Al registrarse se crea la fila de `profiles`.
- Repositorios de `brands` y `cycles`: alta, modificación, archivado.
- Validaciones de nombre vacío y de `margin_pct` fuera de 0–100.
- Elegir un ciclo activo deja exactamente uno activo.
- Playwright: registro, login, logout, y que `/app` sin sesión redirija.

### Etapa 3 — Clientas

Lista con buscador por nombre, alta y edición en hoja inferior (nombre, WhatsApp, notas), archivado, y en cada clienta su deuda actual.

Probás: cargás tres clientas desde el celular, las buscás por nombre, editás un teléfono.

Tests:
- Validación: nombre obligatorio; se recortan los espacios.
- El buscador filtra sin distinguir mayúsculas ni acentos.
- Repositorio de `customers`: alta, modificación, archivado.
- No se puede borrar una clienta con pedidos (se archiva).

### Etapa 4 — Pedidos

El flujo central. Desde "+ Nuevo pedido": elegir clienta (con atajo "+ Nueva clienta" sin salir de la hoja), agregar varios ítems, cada uno con su marca, cantidad, precio y costo opcional. Estado de entrega con los cinco valores. Lista de pedidos del ciclo y detalle editable. Subtotal y ganancia por ítem, en vivo mientras escribís (cálculo local, sin ir al servidor); un solo viaje al servidor al guardar.

Probás: cargás un pedido con tres productos de dos marcas distintas, ves el total y la ganancia mientras escribís, lo guardás, lo abrís de nuevo y lo editás; cambiás el estado a "Recibido".

Tests:
- `itemCost`: con `unitCost` cargado usa ese; sin costo usa el `marginPct` de la marca; sin marca y sin costo el costo es cero.
- `calcOrder`: total, costo y ganancia con varios ítems, cantidades mayores a uno y marcas distintas.
- Validaciones: pedido sin clienta rechazado; sin ítems rechazado; cantidad cero o negativa rechazada; precio negativo rechazado. Se prueban en la Server Action, no solo en el formulario.
- `delivery_status` cambia sin tocar nada de los pagos.
- La hoja de pedido calcula bien el total mientras se escribe (React Testing Library).
- Playwright: alta de pedido de punta a punta.

### Etapa 5 — Pagos

Pagos parciales con fecha y monto, historial dentro del pedido, saldo calculado, botón "Marcar como pagado completo", y el rechazo de pagos mayores al saldo.

Probás: en un pedido de $50.000 registrás $20.000, ves "Debe $30.000"; registrás otros $30.000 y pasa a "Pagado"; intentás cargar $5.000 más y la app no te deja y te dice por qué.

Tests:
- `balance` con cero, uno y varios pagos.
- Pago que supera el saldo: rechazado por la Server Action, con el saldo en el mensaje.
- Pago de exactamente el saldo: aceptado, saldo queda en cero.
- Pago de cero o negativo: rechazado.
- Dos pagos enviados casi al mismo tiempo no pueden pasarse del total entre los dos (el chequeo corre en el servidor leyendo el estado actual del pedido).
- Un pedido entregado puede seguir debiendo; un pedido pagado puede seguir sin entregar (las dos direcciones).
- Borrar un pago recalcula el saldo.

### Etapa 6 — Resumen

El inicio responde de un vistazo: vendido, cobrado, a cobrar, a pagar a marcas, ganancia de productos. Más: pedidos pendientes de entregar, principales deudoras con botón de recordatorio, y la tabla por marca. Todo filtrado por el ciclo del selector, con opción "Todos". El ciclo elegido viaja en la URL (`/app?cycle=…`), así que compartir o recargar la pantalla muestra lo mismo.

Probás: con dos ciclos cargados, cambiás el selector y todos los números cambian; tocás una deudora y llegás a su pedido.

Tests:
- `calcCycle`: los siete números con un conjunto de pedidos armado a mano, incluyendo pagos parciales.
- Los pedidos `cancelled` no suman a ningún total.
- El filtro por ciclo deja afuera los pedidos de otros ciclos.
- `debtors`: ordena de mayor a menor, agrupa varios pedidos de la misma clienta, excluye a quien no debe.
- `byBrand`: agrupa por marca, suma `payable` y `profit`, junta los ítems sin marca en "Sin marca".
- Playwright: cambiar de ciclo cambia los números en pantalla.

### Etapa 7 — Gastos y cierre de ciclo

Gastos por categoría (envío, packaging, publicidad, comisión, otros) asociados al ciclo. Pantalla de cierre con los siete números y el resultado después de gastos. Cerrar el ciclo, y poder consultar los ciclos cerrados.

Probás: cargás $8.000 de envío, ves cómo baja el resultado, cerrás el ciclo, creás el siguiente y volvés a mirar el cerrado.

Tests:
- `result` = `productProfit` − `expenses`, con y sin gastos.
- Validación de gasto: monto cero o negativo rechazado; categoría obligatoria.
- Cerrar un ciclo con pedidos sin cobrar avisa pero no bloquea (la deuda no se pierde: sigue en la clienta).
- Un ciclo `closed` no acepta pedidos ni gastos nuevos (chequeado en la Server Action y con `CHECK` en la base).
- Los ciclos cerrados se siguen pudiendo leer, con sus números intactos.

### Etapa 8 — WhatsApp y cierre funcional de la V1

Compartir el detalle del pedido y mandar recordatorio de deuda, los dos con `wa.me` y el mensaje ya escrito (los textos del prototipo, que están buenos). Normalización de números argentinos. Repaso final: estados vacíos, mensajes de error, pantallas en 1366×768 y 1920×1080, y la checklist de aceptación de los 13 pasos del "Criterio de terminado" del roadmap, verificada a mano.

Probás: los 13 pasos, de punta a punta, desde el celular.

Tests:
- `normalizePhone`: 10 dígitos (`2235551234`), con 0 adelante, con `+54`, con `549` ya puesto, con espacios y guiones, vacío.
- `orderMessage`: incluye los ítems, el total, lo pagado y el saldo; cuando está todo pago dice que está pago.
- `reminderMessage`: incluye el nombre de la clienta y el monto.
- Playwright, de punta a punta: (a) alta de clienta → pedido → pago parcial → ver saldo; (b) gasto → cierre de ciclo → consultar ciclo cerrado.

### Etapa 9 — Landing pública

La cara del producto, para poder invitar a las primeras usuarias con un link que explique de qué se trata. Simple y de una sola página, estática, con la misma identidad visual que la app.

Contenido, tomado de lo que ya está escrito en el prototipo (la pantalla de bienvenida) y en el roadmap:

- Título y una frase: "Tu cuaderno de pedidos, en el celular" / "Anotá qué pidió cada clienta, quién te pagó y quién te debe, y mirá cuánto ganás en cada ciclo."
- Cuatro cosas que hace: pedidos por clienta y por ciclo; pagos parciales y saldos; ganancia por porcentaje de marca o por costo del producto; pedido y recordatorio por WhatsApp.
- Dos o tres capturas reales de la app en un celular.
- Para quién es: revendedoras por catálogo, emprendedoras, personas que hoy usan libreta, notas o Excel.
- Botón "Entrar" y botón "Crear cuenta", los dos a `/app`.
- Una línea sobre cómo instalarla, con el paso de iPhone (Compartir → Agregar a pantalla de inicio).
- Un pie con un mail de contacto.

Si más adelante querés usar los textos y las imágenes de la presentación del producto, se reemplazan sin tocar nada de la app: la landing no comparte lógica con ella.

Probás: abrís el link raíz desde el celular y desde la PC, se lee bien en las dos, los botones llevan a la app, y lo podés compartir por WhatsApp y la vista previa del link se ve bien.

Tests:
- La landing responde sin sesión y no hace ninguna consulta a la base.
- Los metadatos para compartir (título, descripción, imagen de vista previa) están puestos.
- Los links a `/app` apuntan donde tienen que apuntar.
- Playwright: la landing carga, se ve bien en ancho de celular y de escritorio, y el botón "Entrar" llega al login.

## Verificación

En cada etapa, antes de darla por terminada:

1. `npm test` — unitarios y de componentes, todos en verde.
2. `npm run lint` y `npx tsc --noEmit` — sin errores.
3. `npm run build` — el build de Next.js pasa.
4. `npx playwright test` — los flujos de punta a punta de las etapas hechas hasta ahí.
5. Deploy a Vercel y prueba a mano desde el celular, con los pasos que figuran en la etapa.
6. Al cerrar: qué cambió, qué archivos, qué riesgos, y cómo probarlo.

Al final de la Etapa 8, la checklist de los 13 pasos del roadmap verificada una por una, y una revisión del código con subagente contra este plan y `CLAUDE.md`.
