# Componentes UI accesibles

El dashboard muestra **análisis primero y tabla después**, ambos a ancho completo. Los datos son ficticios y de solo lectura: no hay guardado ni operaciones de negocio.

## Reutilizar

| Componente         | Contrato                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Select`           | Código oficial shadcn + Radix, portal, teclado y foco. Componer trigger/value/content/items y asociar `label` al `SelectTrigger`. `onValueChange` recibe un string; no usar `onChange` nativo.                                                          |
| `DataTable`        | Búsqueda, filtros, orden opcional (`sortable: true`), 25/50/100 filas, paginación, estado vacío Lottie y limpiar filtros. En desktop renderiza una tabla semántica; debajo de `md` renderiza cada fila como card. Usar `caption` y `getRowId` para tablas nuevas. |
| `Pagination`       | Composición oficial `Pagination → PaginationContent → PaginationItem → PaginationLink/Previous/Next/Ellipsis`. Adaptada a botones porque cambia estado local, no una URL. Incluye `disabled` nativo y `aria-current`.                                   |
| `Dialog` / `Sheet` | Radix gestiona portal, foco, Escape y fondo inerte. Siempre incluir título y descripción. `DialogTrigger asChild` / `DialogClose asChild` funcionan con `Button`. Sheet móvil se cierra al navegar o pasar a escritorio.                                |
| `Badge`            | Solo `success` verde, `info` azul y `error` rojo. El texto identifica el estado sin depender del color.                                                                                                                                                 |
| `Alert`            | `info` y `success` usan `role="status"`; `error` usa `role="alert"`. Componer `AlertTitle` y `AlertDescription`. No anunciar éxito de persistencia sin una operación real.                                                                              |
| `EmptyState`       | Usa la animación Lottie local de `public/animations/empty-search.json`, texto accesible y fallback con icono cuando la animación falla o se prefiere reducir movimiento. |

```tsx
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger aria-label="Estado"><SelectValue /></SelectTrigger>
  <SelectContent><SelectItem value="confirmed">Confirmada</SelectItem></SelectContent>
</Select>

<Alert variant="error">
  <AlertTitle>No se pudo completar la acción</AlertTitle>
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>
```

## Estilo y dependencias

- `components.json` configura aliases del monolito. No ejecutar un `init` que sustituya la estructura ni actualizar Next/Tailwind para añadir componentes.
- `globals.css` define `#33A7DC` como primary, texto blanco para superficies primary, popover, borde y foco; `tailwind.config.ts` los publica como utilidades. Las variantes viven en UI, no en páginas.
- Radix Select/Dialog/Slot aportan interacción y composición accesible. `lottie-react` reproduce la animación local del empty state; se respeta `prefers-reduced-motion` y existe fallback estático.
- `@playwright/test` es la única dependencia nueva de pruebas: verifica interacciones reales, no solo snapshots. Los helpers de paginación también se prueban con datos de más de 100 filas.

## Verificar

En PowerShell usar `npm.cmd`. Ejecutar en orden y detenerse ante un error:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. `npm run test:ui` (inicia el build de producción en el puerto 3100).

Playwright necesita Chromium (`npm exec -- playwright install chromium`). Si ya existe un binario compatible, se puede indicar su ruta en `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Para probar un servidor existente, establecer `PLAYWRIGHT_BASE_URL`; no usarlo contra ediciones parciales.

Revisar teclado en Select, búsqueda sin resultados, orden, 25/50/100, foco de Dialog, menú móvil y colapso de escritorio. Las capturas quedan en `test-results/` y no reemplazan la revisión visual humana.

## Procedencia oficial

- [Select](https://ui.shadcn.com/docs/components/radix/select), [Pagination](https://ui.shadcn.com/docs/components/radix/pagination), [Dialog](https://ui.shadcn.com/docs/components/radix/dialog), [Sheet](https://ui.shadcn.com/docs/components/radix/sheet), [components.json](https://ui.shadcn.com/docs/components-json).
- Fuente importada: `https://ui.shadcn.com/r/styles/new-york/{select,pagination,dialog,sheet}.json`. Se adaptaron aliases, colores, etiquetas en español, tamaños responsive y enlaces de paginación a botones locales. Se conserva la composición y las primitivas, no un reemplazo nativo.
