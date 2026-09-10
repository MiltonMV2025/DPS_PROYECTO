# Sonrisa Digital

Sistema web de gestión para la clínica dental Sonrisa Perfecta, construido con
Next.js (App Router) y MySQL. Corresponde a la Etapa 2 del proyecto de cátedra
de DPS941.

## Requisitos

- Node.js 20 o superior
- npm
- Una base de datos MySQL 8 accesible

## Instalación

```bash
npm install
cp .env.example .env.local
```

En Windows PowerShell, usar `Copy-Item .env.example .env.local`.

## Variables de entorno

Consultar `.env.example`. No agregar secretos reales al repositorio.

- `DATABASE_URL`: connection string MySQL con el formato
  `mysql://username:password@host:3306/database_name`. Las credenciales deben
  estar codificadas como URL si contienen caracteres reservados. El pool se crea
  de forma lazy en `src/backend/database/pool.ts`.
- `AUTH_SECRET`: secreto usado para firmar los tokens de sesión. Generar uno con
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- `INTERNAL_API_SECRET` e `INTERNAL_API_BASE_URL`: protegen los Route Handlers
  internos de solo lectura usados por el dashboard.

## Funcionalidades

- **Autenticación**: registro de pacientes, inicio de sesión y cierre de sesión.
  Las sesiones viajan en una cookie firmada (JWT) y las rutas del panel están
  protegidas por middleware.
- **Roles y permisos**: administrador, odontólogo, recepcionista y paciente. La
  navegación y las páginas sensibles se habilitan según el rol; las operaciones
  de escritura se validan también en el servidor.
- **Gestión de citas (CRUD)**: crear citas, cambiar su estado
  (confirmar, completar, cancelar) y eliminarlas. Incluye validación de choques
  de agenda por duración y notificación a la lista de espera al cancelar.
- **Dashboard y reportes**: métricas operativas calculadas en la base de datos y
  una gráfica de citas por estado.
- **Consultas de apoyo**: pacientes, historiales, inventario, proveedores y
  usuarios en tablas con búsqueda, filtros y paginación.

## Cuentas de demostración

El seed crea cuentas con la contraseña `Dps2026*`:

- `claudia.menendez@sonrisaperfecta.sv` — administrador
- `ernesto.rivas@sonrisaperfecta.sv` — odontólogo
- `recepcion@sonrisaperfecta.sv` — recepcionista
- `karla.beltran@gmail.com` — paciente

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run lint`: validación ESLint.
- `npm run typecheck`: comprobación TypeScript estricta.
- `npm run build`: build de producción.
- `npm run format:check`: validación de formato.
- `npm run db:migrate`: crea la base si no existe y aplica migraciones pendientes.
- `npm run db:seed -- --confirm-seed`: ejecuta el seed explícitamente después
  del schema. El seed hace `TRUNCATE` y está bloqueado por defecto; también se
  puede confirmar con `SEED_CONFIRM_DATABASE=nombre_exacto_de_la_base`.

Las migraciones están en `src/backend/database/migrations`. El runner no se
ejecuta al importar la aplicación y registra lo aplicado en `_migrations`.

## Arquitectura

Monolito modular con App Router. El flujo de una petición es
`UI → API/Controller → Service → Repository → Data Source`. Los detalles están
en `docs/ARCHITECTURE.md`.

## Estructura del proyecto

`src/app` contiene el routing y los Route Handlers; `src/frontend` la
presentación, features y providers; `src/backend` los módulos de negocio,
servicios, repositorios y persistencia; `src/shared` los contratos comunes.

## Flujo de trabajo Git

Crear ramas desde `develop`, usar `feature/*`, `fix/*` o `chore/*`, y abrir Pull
Requests hacia `develop`. Ver `docs/CONTRIBUTING.md`.

## Despliegue

La aplicación se despliega en Vercel. Configurar `DATABASE_URL`, `AUTH_SECRET`,
`INTERNAL_API_SECRET` e `INTERNAL_API_BASE_URL` (la URL pública del despliegue)
como variables de entorno del proyecto.
