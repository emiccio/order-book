# Libreta de Ventas --- Roadmap de producto V1 → V4

## Decisión inicial

### Plataforma recomendada: WebApp responsive + PWA

Para el MVP conviene empezar con una **webapp mobile-first**, instalable
como PWA.

No haría una app React Native nativa todavía.

**Motivos:**

-   Permite validar el producto mucho más rápido.
-   Se comparte con un link.
-   Funciona en celular y PC.
-   Evita mantener dos aplicaciones.
-   El flujo principal no necesita capacidades nativas especiales.
-   Los mensajes de WhatsApp pueden abrirse mediante `wa.me` sin que
    WhatsApp sea la interfaz de la aplicación.
-   Si el producto consigue uso recurrente, entonces se puede evaluar
    React Native con datos reales de uso.

### Regla de producto

> Primero validar que las personas quieran usar la libreta. Después
> automatizarla.

No incorporar WhatsApp como interfaz conversacional en V1. WhatsApp
queda como **canal de comunicación** para compartir pedidos y
recordatorios.

------------------------------------------------------------------------

# V1 --- Libreta

## Objetivo

Resolver el trabajo básico de una revendedora/emprendedora:

> Registrar una venta, registrar lo que cobró, saber cuánto queda
> pendiente y cerrar el ciclo sabiendo cuánto vendió y cuánto ganó.

## Usuarios objetivo

-   Revendedoras por catálogo.
-   Emprendedoras que venden productos propios.
-   Personas que venden varias marcas/proveedores.
-   Personas que actualmente usan libreta, notas, Excel o chats para
    organizarse.

## Funcionalidades

### 1. Clientas

-   Alta, edición y baja.
-   Nombre.
-   WhatsApp.
-   Notas.
-   Historial de pedidos.
-   Saldo pendiente.
-   Total comprado.

### 2. Ciclos

-   Crear ciclo/campaña/mes.
-   Seleccionar ciclo activo.
-   Ver información por ciclo.
-   Cerrar o finalizar ciclo.
-   Mantener ciclos históricos.

### 3. Marcas / proveedores

-   Nombre.
-   Porcentaje de ganancia, cuando corresponda.
-   Costo específico para productos propios.
-   Poder tener varias marcas en un mismo pedido.

### 4. Productos dentro del pedido

Cada pedido puede tener:

-   Producto.
-   Marca/proveedor.
-   Cantidad.
-   Precio de venta.
-   Costo.
-   Ganancia calculada.

No hace falta construir un catálogo completo en la primera iteración si
eso demora la validación. Puede comenzar como una lista de productos
frecuentes y evolucionar después.

### 5. Pedidos

Estados mínimos:

-   Pendiente de recibir.
-   Recibido.
-   Pendiente de entregar.
-   Entregado.
-   Cancelado.

El estado de pago es independiente del estado de entrega.

Esto evita mezclar:

> "La clienta ya lo recibió"

con:

> "La clienta ya lo pagó".

### 6. Pagos

-   Pago total.
-   Pagos parciales.
-   Fecha.
-   Monto.
-   Saldo automático.
-   Historial de pagos.

### 7. Gastos

Agregar una sección simple para gastos relacionados con el negocio:

-   Envío.
-   Packaging.
-   Publicidad.
-   Comisiones.
-   Otros.

La V1 no necesita contabilidad.

El objetivo es distinguir:

**Ganancia de productos**

de

**Ganancia después de gastos**.

### 8. Dashboard / Inicio

El inicio debería responder rápidamente:

-   Cuánto vendí.
-   Cuánto cobré.
-   Cuánto me deben.
-   Cuánto tengo que pagar.
-   Ganancia estimada.
-   Gastos.
-   Ganancia después de gastos.
-   Pedidos pendientes de entregar.
-   Principales deudoras.

### 9. WhatsApp como canal

Desde un pedido:

-   Compartir detalle por WhatsApp.

Desde una deuda:

-   Generar recordatorio.

La app abre WhatsApp con el mensaje preparado.

**No implementar todavía:**

-   Bot conversacional.
-   Recepción automática de pedidos por WhatsApp.
-   IA dentro de WhatsApp.
-   Procesamiento automático de mensajes.

------------------------------------------------------------------------

# V1 --- UX principal

El flujo principal debe ser extremadamente corto:

``` text
Inicio
  ↓
+ Nuevo pedido
  ↓
Elegir clienta
  ↓
Agregar productos
  ↓
Guardar
  ↓
Registrar pago cuando corresponda
  ↓
Entregar
  ↓
Ver saldo
  ↓
Cerrar ciclo
```

El segundo flujo más importante:

``` text
Inicio
  ↓
Quién me debe
  ↓
Ver pedido
  ↓
Ver saldo
  ↓
Recordar por WhatsApp
```

Y el tercero:

``` text
Inicio
  ↓
Cierre del ciclo
  ↓
Vendido
Cobrado
A cobrar
A pagar
Ganancia
Gastos
Resultado
```

------------------------------------------------------------------------

# V1 --- Criterios de éxito

No medir solamente cantidad de usuarios registrados.

Medir:

-   ¿Registró al menos 5 pedidos?
-   ¿Terminó un ciclo?
-   ¿Registró pagos parciales?
-   ¿Consultó quién debe?
-   ¿Usó el cierre de ciclo?
-   ¿Volvió a usar la app en el ciclo siguiente?
-   ¿Dejó de usar la libreta/Excel para parte del trabajo?
-   ¿Preguntó cuánto cuesta?

La señal más importante:

> Una persona termina un ciclo y vuelve a usar la app para el siguiente
> sin que haya que convencerla.

------------------------------------------------------------------------

# V1.1 --- Ajustes después de la prueba

Antes de construir V2, corregir lo que aparezca en uso real.

Prioridad:

1.  Errores.
2.  Datos difíciles de cargar.
3.  Pantallas que generan confusión.
4.  Cálculos que no coinciden con la realidad.
5.  Acciones que requieren demasiados pasos.
6.  Funcionalidades solicitadas repetidamente.

No agregar funcionalidades solamente porque "podrían estar buenas".

------------------------------------------------------------------------

# V2 --- Asistente

## Objetivo

Pasar de:

> "La app guarda mis datos"

a:

> "La app me ayuda a saber qué tengo que hacer".

## Funcionalidades

### Hoy

Una pantalla accionable:

-   3 personas deben dinero.
-   2 pedidos todavía no fueron entregados.
-   Hay un ciclo por cerrar.
-   Hay dinero pendiente de pagar a una marca.
-   Hay un pago esperado hoy.

### Recordatorios

Recordatorios internos:

-   Cobrar.
-   Entregar.
-   Pagar proveedor.
-   Cerrar ciclo.

### Productos frecuentes

Guardar productos utilizados habitualmente:

-   Nombre.
-   Marca.
-   Precio habitual.
-   Costo/margen.
-   Última modificación.

Al crear un pedido:

> buscar producto → completar datos → cambiar cantidad.

### Historial de clientas

Mostrar:

-   Cantidad de pedidos.
-   Total comprado.
-   Última compra.
-   Promedio de compra.
-   Deuda actual.

### Alertas

Ejemplos:

-   "Laura tiene \$35.000 pendientes."
-   "Tenés 4 pedidos sin entregar."
-   "El ciclo tiene \$80.000 por cobrar."
-   "El ciclo está listo para cerrar."

## Lo que NO hacer todavía

No convertir V2 en un ERP.

No agregar:

-   Contabilidad completa.
-   Stock avanzado.
-   Facturación electrónica.
-   CRM complejo.
-   Automatizaciones masivas.

------------------------------------------------------------------------

# V3 --- Analista

## Objetivo

Ayudar a decidir:

> "¿Qué me conviene vender?"

## Métricas

### Productos

-   Más vendidos.
-   Más rentables.
-   Menos rentables.
-   Evolución de precio.
-   Margen.

### Marcas

-   Ventas por marca.
-   Ganancia por marca.
-   Dinero a pagar.
-   Participación de cada marca.

### Clientas

-   Mejores clientas por facturación.
-   Mejores clientas por frecuencia.
-   Clientes inactivos.
-   Deudas históricas.

### Ciclos

Comparar:

-   Ventas.
-   Cobros.
-   Deuda.
-   Ganancia.
-   Gastos.
-   Resultado.

Ejemplo:

``` text
Ciclo 12 → $120.000 vendidos
Ciclo 13 → $145.000 vendidos
Ciclo 14 → $173.000 vendidos
```

## Recomendaciones

Más adelante la app podría decir:

> "Las velas representan el 18% de tus ventas pero el 31% de tu
> ganancia."

O:

> "Laura compró 4 veces en los últimos 3 ciclos."

La analítica debe convertir datos que ya existen en decisiones útiles.

------------------------------------------------------------------------

# V4 --- Automatización

## Objetivo

Reducir tareas repetitivas.

Esta etapa recién debería plantear integraciones más profundas.

### Posibles funcionalidades

-   Importar productos.
-   Importar pedidos desde archivos.
-   Importar listas de precios.
-   Automatizar recordatorios.
-   Automatizar resúmenes de ciclo.
-   Integraciones con plataformas externas.
-   Mensajería más integrada.
-   Automatizaciones programadas.

### WhatsApp

Recién en V4 evaluar:

> "Quiero pedirle a la app un pedido directamente por WhatsApp."

Ejemplo futuro:

``` text
Laura:
"Quiero dos cremas Ekos y un Kaiak"

        ↓

Sistema interpreta

        ↓

"Encontré:
2 x Crema Ekos
1 x Kaiak

Total: $63.900

¿Confirmo el pedido?"

        ↓

Usuario confirma

        ↓

Pedido creado
```

Esto es interesante, pero **no debe condicionar el MVP**.

------------------------------------------------------------------------

# Arquitectura de evolución

## V1

``` text
WebApp / PWA
      ↓
API / Backend
      ↓
Base de datos
      ↓
Usuarios
Clientas
Pedidos
Pagos
Productos
Marcas
Ciclos
Gastos
```

## V2

Agregar:

``` text
Motor de tareas
       ↓
Recordatorios
Alertas
"Hoy"
```

## V3

Agregar:

``` text
Datos históricos
       ↓
Métricas
       ↓
Analítica
       ↓
Recomendaciones
```

## V4

Agregar:

``` text
Integraciones
       ↓
Automatizaciones
       ↓
Canales externos
       ↓
WhatsApp / otros
```

------------------------------------------------------------------------

# Prompt para evolucionar el código actual hacia V1

Usar este prompt con la IA de código:

> Quiero evolucionar el prototipo actual de "Libreta de Ventas" hacia un
> MVP real de V1.
>
> El producto es una webapp mobile-first/PWA para revendedoras por
> catálogo y emprendedoras. NO quiero construir todavía una app React
> Native nativa y NO quiero convertir WhatsApp en la interfaz de la
> aplicación.
>
> WhatsApp debe quedar únicamente como canal externo para compartir un
> pedido o enviar un recordatorio de pago.
>
> ## Objetivo principal
>
> El MVP debe resolver este flujo:
>
> `Clienta → Pedido → Pago → Entrega → Saldo → Ganancia → Cierre de ciclo`
>
> La persona debería poder abrir la app y responder rápidamente:
>
> -   ¿Cuánto vendí?
> -   ¿Cuánto cobré?
> -   ¿Quién me debe?
> -   ¿Cuánto tengo que pagar?
> -   ¿Cuánto gané?
> -   ¿Qué pedidos tengo pendientes?
>
> ## Antes de modificar
>
> 1.  Analizá el código existente completo.
> 2.  Identificá componentes, estado, modelos, cálculos y persistencia
>     existentes.
> 3.  No reescribas todo.
> 4.  Conservá la lógica que ya funciona.
> 5.  Hacé cambios incrementales.
> 6.  Si encontrás una decisión de arquitectura que necesite cambiar,
>     explicá primero por qué.
> 7.  No agregues abstracciones innecesarias.
>
> ## Alcance V1
>
> Implementar y dejar sólido:
>
> ### Clientas
>
> -   nombre
> -   WhatsApp
> -   notas
> -   historial de pedidos
> -   deuda actual
>
> ### Ciclos
>
> -   crear ciclo
> -   seleccionar ciclo activo
> -   ver histórico
> -   cerrar ciclo
>
> ### Marcas/proveedores
>
> -   nombre
> -   porcentaje de ganancia
> -   soporte para productos propios con costo específico
>
> ### Productos del pedido
>
> -   nombre
> -   marca/proveedor
> -   cantidad
> -   precio de venta
> -   costo
> -   ganancia calculada
>
> ### Pedidos
>
> Un pedido puede contener múltiples productos y marcas.
>
> Estados de entrega:
>
> -   pendiente de recibir
> -   recibido
> -   pendiente de entregar
> -   entregado
> -   cancelado
>
> El estado de entrega NO debe mezclarse con el estado de pago.
>
> ### Pagos
>
> -   pagos parciales
> -   fecha
> -   monto
> -   saldo automático
> -   marcar pagado completo
> -   historial
>
> ### Gastos
>
> Agregar gastos simples del negocio:
>
> -   envío
> -   packaging
> -   publicidad
> -   comisión
> -   otros
>
> No construir contabilidad.
>
> ### Dashboard
>
> Mostrar para el ciclo seleccionado:
>
> -   vendido
> -   cobrado
> -   pendiente de cobro
> -   dinero a pagar a marcas/proveedores
> -   ganancia de productos
> -   gastos
> -   resultado después de gastos
> -   pedidos pendientes de entrega
> -   principales deudoras
>
> ### WhatsApp
>
> Mantener:
>
> -   compartir pedido
> -   recordar pago
>
> Usar link externo / `wa.me`.
>
> NO implementar:
>
> -   bot
> -   webhook
> -   lectura de mensajes
> -   IA conversacional
> -   creación automática de pedidos desde WhatsApp
>
> ## UX
>
> Mobile-first.
>
> La pantalla inicial debe priorizar acciones y números importantes.
>
> El botón `+ Nuevo pedido` debe ser siempre fácil de encontrar.
>
> Reducir al mínimo la cantidad de pasos para crear un pedido.
>
> Evitar menús complejos.
>
> No construir inventario avanzado.
>
> No construir facturación.
>
> No construir contabilidad.
>
> No construir CRM.
>
> ## Modelo de datos
>
> Revisá el modelo existente antes de modificarlo.
>
> Si actualmente los datos están en localStorage/demo data, prepará una
> capa de persistencia desacoplada para poder reemplazarla por
> backend/base de datos sin reescribir toda la UI.
>
> Separá:
>
> -   entidades
> -   cálculos
> -   persistencia
> -   UI
>
> Pero sin crear una arquitectura innecesariamente compleja.
>
> ## Cálculos
>
> Mantener explícitamente separados:
>
> `total vendido`
>
> `total cobrado`
>
> `total pendiente`
>
> `costo de productos`
>
> `ganancia de productos`
>
> `gastos`
>
> `resultado después de gastos`
>
> Nunca asumir que:
>
> `vendido = cobrado`
>
> ni que:
>
> `ganancia = dinero disponible`
>
> ## Validaciones
>
> Agregar validaciones para:
>
> -   pedido sin clienta
> -   pedido sin productos
> -   cantidades inválidas
> -   precios inválidos
> -   pagos mayores al total
> -   gastos inválidos
> -   ciclos inexistentes
>
> Evitar datos inconsistentes.
>
> ## Responsive
>
> Prioridad:
>
> 1.  teléfono
> 2.  tablet
> 3.  desktop
>
> Mantener también buena experiencia en 1366x768 y 1920x1080.
>
> ## PWA
>
> Preparar la aplicación para poder instalarse como PWA si el stack
> actual lo permite.
>
> Debe poder abrirse desde un link y sentirse como una app móvil.
>
> No agregar funcionalidades nativas que no sean necesarias.
>
> ## Calidad
>
> No quiero una refactorización masiva.
>
> Quiero cambios pequeños y revisables.
>
> Después de cada bloque funcional:
>
> 1.  explicar qué cambió
> 2.  indicar archivos modificados
> 3.  indicar posibles riesgos
> 4.  indicar cómo probarlo manualmente
>
> Si existe una parte del código que ya funciona correctamente, no la
> reemplaces solo por preferencia arquitectónica.
>
> ## Criterio de terminado
>
> Considerá V1 terminada cuando una persona pueda:
>
> 1.  crear una clienta
> 2.  crear un ciclo
> 3.  configurar una marca
> 4.  crear un pedido con varios productos
> 5.  registrar un pago parcial
> 6.  registrar otro pago
> 7.  marcar la entrega
> 8.  consultar quién debe
> 9.  enviar un recordatorio por WhatsApp
> 10. registrar un gasto
> 11. ver el resultado del ciclo
> 12. cerrar el ciclo
> 13. volver a consultar ciclos anteriores
>
> Antes de terminar, generá una checklist de aceptación con estos casos
> y verificá que todos funcionen.
>
> No avances hacia V2, V3 o V4 hasta que V1 sea usable con datos reales.
