# Sonrisa Digital — reglas del proyecto

## Propósito

Sonrisa Digital es un monolito modular Next.js para la gestión de una clínica dental. Actualmente se encuentra en el scaffold inicial de la Etapa 2.

## Comandos obligatorios

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

Antes de abrir un Pull Request, `lint`, `typecheck` y `build` deben pasar.

## Arquitectura

- `src/app`: routing, layouts, páginas y Route Handlers.
- `src/frontend`: UI, features, hooks, providers y clientes de API.
- `src/backend`: controllers, services, repositories, schemas, configuración y persistencia futura.
- `src/shared`: tipos, constantes y utilidades puras compartidas.
- Flujo permitido: `UI → API/Controller → Service → Repository → Data Source`.

### Límites que no deben romperse

- Los componentes React no acceden directamente a repositories.
- Los `route.ts` solo adaptan HTTP; no contienen lógica de negocio ni acceso a base de datos.
- Backend no depende de páginas, componentes o código de presentación.
- `shared` no debe importar frontend, backend ni infraestructura.
- No crear microservicios ni una segunda aplicación.

## UI y componentes reutilizables

- Los componentes base viven en `src/frontend/components/ui`. `Select`, `Dialog`, `Sheet` y `Pagination` se basan en el código oficial de shadcn/ui (registro `new-york`, compatible con Tailwind 3); no llamar shadcn a wrappers nativos.
- Usar `cn` desde `src/frontend/lib/utils.ts` para combinar clases.
- Preferir `Button`, `Card`, `Badge`, `Alert`, `Table` y `Progress` antes de duplicar markup.
- Usar los componentes `Select` y `DataTable` para controles y tablas; no usar selects o tablas ad-hoc en páginas.
- El color primario es azul celeste `#33A7DC`, con `primary-foreground` blanco para superficies primarias. El texto independiente sobre fondos claros debe usar `text-primary` o `foreground`; no usar `primary-foreground` fuera de una superficie primaria.
- Los estados vacíos de tablas usan `EmptyState` con una animación Lottie local, texto accesible y fallback estático cuando la animación no carga o el usuario reduce movimiento.
- En mobile, `DataTable` se presenta como cards; en desktop conserva la tabla semántica.
- Mostrar primero el análisis rápido a ancho completo y después la tabla a ancho completo; no volver al diseño de métricas debajo de la tabla.
- Chips únicamente verdes (`success`), azules (`info`) o rojos (`error`), siempre con texto de estado.
- `Select` usa Radix y portal: componer `SelectTrigger`, `SelectValue`, `SelectContent` y `SelectItem`, con etiqueta accesible. No usar `<select>` nativos como reemplazo.
- `Pagination` conserva la composición oficial con botones para estado local, `aria-current` y límites deshabilitados. Mantener tamaños 25/50/100, filtros, búsqueda, vacíos y columnas no ordenables.
- Usar `Dialog` para modales y `Sheet` para navegación móvil, con título, descripción, cierre por Escape y restauración de foco. Sidebar expandida con iconos en escritorio, oculta en móvil; colapso opcional en escritorio.
- Usar `Alert` con `success`, `error` o `info`. No mostrar persistencia exitosa ficticia ni acciones sin comportamiento; esta etapa es demostración de solo lectura.
- Probar navegación por teclado y foco, además del diseño responsive. Consultar `docs/UI_COMPONENTS.md` para composición y pruebas.
- Las tablas deben ocupar el ancho disponible y permitir columnas no ordenables explícitamente.
- Las variantes visuales deben mantenerse en los componentes UI, no dispersarse en las páginas.
- Las páginas deben encargarse de composición y datos, no convertirse en librerías de componentes gigantes.
- No agregar dependencias UI nuevas sin justificarlo.

## Estado actual

La Etapa 2 implementa autenticación con sesión (JWT en cookie), roles y rutas
protegidas, CRUD de citas con reglas de negocio (choque de agenda y lista de
espera), dashboard y reportes con datos reales de MySQL. Los módulos de
pacientes, historiales, inventario, proveedores y usuarios se muestran en modo
consulta. No agregar ORMs ni integraciones externas sin justificarlo.

## TypeScript y nombres

- TypeScript estricto; evitar `any`, imports circulares y tipos duplicados.
- Nombres técnicos en inglés y carpetas en `kebab-case`.
- Componentes en `PascalCase.tsx`; hooks en `useSomething.ts`.
- Textos visibles pueden estar en español.

## Colaboración

- Crear ramas desde `develop`.
- Usar `feature/*`, `fix/*` o `chore/*`.
- Abrir Pull Requests hacia `develop`.
- No hacer commits directamente sobre `main`.
- Mantener commits pequeños y enfocados.
