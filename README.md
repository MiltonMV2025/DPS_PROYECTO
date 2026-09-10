# Sonrisa Digital

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```bash
npm install
cp .env.example .env.local
```

En Windows PowerShell, usar `Copy-Item .env.example .env.local`.

## Variables de entorno

Consultar `.env.example`. No agregar secretos reales al repositorio.

`DATABASE_URL` acepta un connection string MySQL con el formato
`mysql://username:password@host:3306/database_name`. Las credenciales deben
estar codificadas como URL si contienen caracteres reservados. El pool se crea
de forma lazy en `src/backend/database/pool.ts`.

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run lint`: validación ESLint.
- `npm run typecheck`: comprobación TypeScript estricta.
- `npm run build`: build de producción.
- `npm run format:check`: validación de formato.
- `npm run db:migrate`: crea `sonrisa_db` si no existe y aplica migraciones pendientes.
- `npm run db:seed -- --confirm-seed`: ejecuta el seed explícitamente después
  del schema. El seed hace `TRUNCATE` y está bloqueado por defecto; también se
  puede confirmar con `SEED_CONFIRM_DATABASE=nombre_exacto_de_la_base`.

Las migraciones están en `src/backend/database/migrations`. El runner no se
ejecuta al importar la aplicación y registra lo aplicado en `_migrations`.
El seed es deliberadamente reinicializador de datos de demostración (`TRUNCATE`);
no debe ejecutarse sobre datos productivos.

## Arquitectura

El proyecto usa un monolito modular con App Router. La separación principal está documentada en `docs/ARCHITECTURE.md`.

## Estructura del proyecto

`src/app` contiene el routing; `src/frontend` la presentación; `src/backend` los límites de aplicación y persistencia; `src/shared` los contratos comunes. Los módulos futuros están delimitados por funcionalidad.

## Flujo de trabajo Git

Crear ramas desde `develop`, usar `feature/*`, `fix/*` o `chore/*`, y abrir Pull Requests hacia `develop`. Ver `docs/CONTRIBUTING.md`.

## Estado actual

Esta versión es el scaffold inicial de la Etapa 2. Incluye estructura, navegación placeholder y un endpoint de salud; todavía no contiene lógica de negocio, autenticación real, modelo de datos ni CRUD.

## API interna de lectura

Los Route Handlers de datos requieren el header x-internal-api-key y INTERNAL_API_SECRET. Si falta la variable, responden 503 sin datos. server-read.ts usa el mismo secreto server-side mediante INTERNAL_API_BASE_URL.
