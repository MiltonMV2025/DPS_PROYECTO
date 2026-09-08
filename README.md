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

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run lint`: validación ESLint.
- `npm run typecheck`: comprobación TypeScript estricta.
- `npm run build`: build de producción.
- `npm run format:check`: validación de formato.

## Arquitectura

El proyecto usa un monolito modular con App Router. La separación principal está documentada en `docs/ARCHITECTURE.md`.

## Estructura del proyecto

`src/app` contiene el routing; `src/frontend` la presentación; `src/backend` los límites de aplicación y persistencia; `src/shared` los contratos comunes. Los módulos futuros están delimitados por funcionalidad.

## Flujo de trabajo Git

Crear ramas desde `develop`, usar `feature/*`, `fix/*` o `chore/*`, y abrir Pull Requests hacia `develop`. Ver `docs/CONTRIBUTING.md`.

## Estado actual

Esta versión es el scaffold inicial de la Etapa 2. Incluye estructura, navegación placeholder y un endpoint de salud; todavía no contiene lógica de negocio, autenticación real, modelo de datos ni CRUD.
