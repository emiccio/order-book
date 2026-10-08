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

## Arquitectura
- Separar entidades, cálculos, persistencia y UI, sin abstracciones de más.
- Los cálculos son funciones puras con tests.
- La persistencia va detrás de una capa propia, para poder pasar de guardado local a un backend sin reescribir la UI.

## Forma de trabajo
- Cambios chicos y revisables. Antes de un cambio grande de arquitectura, explicar por qué y esperar aprobación.
- Antes de dar algo por terminado: correr los tests y el build, y mostrar el resultado.
- Al cerrar cada bloque: qué cambió, archivos modificados, riesgos y cómo probarlo a mano desde el celular.
- Cuando se definan los comandos del proyecto (instalar, desarrollo, tests, build), agregarlos acá en una sección "Comandos".
