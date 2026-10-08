# Cómo empezar con Claude Code

Este archivo es para vos, no para Claude. Podés borrarlo cuando ya no lo necesites.

## 1. Preparar la carpeta

1. Descomprimí esta carpeta donde quieras trabajar.
2. Abrí una terminal dentro de `libreta-de-ventas` y escribí `claude`.

## 2. Primera sesión: el plan (sin código)

1. Apretá `Shift+Tab` hasta que abajo diga **plan mode on**. En ese modo Claude lee y propone, pero no toca archivos.
2. Pegá este mensaje:

```
Leé CLAUDE.md, docs/roadmap.md y docs/prototipo.html. Es un proyecto nuevo: todavía no hay código.

Quiero construir la V1 de Libreta de Ventas. Antes de escribir código:

1. Resumime en pocas líneas qué entendiste del producto y del alcance de la V1.
2. Proponé el stack para una WebApp mobile-first instalable como PWA, con pros y contras breves. Tené en cuenta que la quiero probar con 10 a 20 personas, cada una con su cuenta y sus datos en el celular y en la PC. Decime si conviene arrancar con guardado local y pasar a un backend antes de la prueba, o usar backend desde el principio.
3. Proponé el modelo de datos.
4. Dividí la V1 en etapas chicas. Cada etapa tiene que terminar en algo que yo pueda probar desde el celular.
5. Para cada etapa, decime qué tests vas a escribir.
6. Hacé todas las preguntas que necesites antes de cerrar el plan, usando AskUserQuestion. Explicame las decisiones técnicas en palabras simples.

No escribas código hasta que yo apruebe el plan. Cuando lo apruebe, guardalo en docs/plan-v1.md.
```

3. Respondé sus preguntas, pedile cambios si algo no te cierra y aprobá el plan cuando esté bien.

## 3. Construir, una etapa por vez

Para cada etapa del plan:

1. Escribí `/clear` para empezar con la memoria limpia (el plan queda guardado en `docs/plan-v1.md`).
2. Pegá:

```
Implementá la etapa [N] de docs/plan-v1.md. Escribí los tests de esa etapa y corrélos junto con el build. Al terminar, mostrame el resultado de los tests y decime qué cambió, qué archivos tocaste, qué riesgos ves y cómo lo pruebo desde el celular.
```

3. Probala vos desde el celular. Si algo falla, contale qué hiciste, qué esperabas y qué pasó.
4. Si corregiste lo mismo dos veces y sigue mal, hacé `/clear` y volvé a pedirlo con más detalle.

## 4. Cerrar la V1

Cuando estén todas las etapas:

```
Armá una checklist de aceptación con los 13 pasos del "Criterio de terminado" de docs/roadmap.md y verificá cada uno. Después usá un subagente para revisar el código contra docs/plan-v1.md y CLAUDE.md, y reportá solo los problemas que afecten el funcionamiento o el alcance.
```

## Consejos

- No le cargues el PDF de la presentación: es para mostrar el producto. Todo lo que Claude necesita está en `docs/roadmap.md`, y en texto lo lee mejor.
- `Esc` frena a Claude en cualquier momento. `Esc` dos veces vuelve a un punto anterior.
- Si en algún momento algo de `CLAUDE.md` deja de ser cierto, pedile que lo actualice.
