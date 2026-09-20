# Sonrisa Digital

Sistema web para la gestión integral de la clínica dental **Sonrisa Perfecta**.
Este repositorio corresponde a la **Entrega Parcial Web — Etapa 2** de la
asignatura DPS941.

## Entrega académica

| Campo | Información |
|---|---|
| Etapa | Etapa 2: Entrega Parcial Web (React + Next.js) |
| Fecha máxima | Domingo 20 de septiembre de 2026, 11:59 p. m. |
| Fecha de entrega | 20 de septiembre de 2026 |
| Repositorio | [DPS_PROYECTO en GitHub](https://github.com/MiltonMV2025/DPS_PROYECTO) |
| Reserva de defensa | Se publicará el domingo 20 de septiembre de 2026 |

### Integrantes

| Estudiante | Carné |
|---|---|
| Milton Antonio Mayorga Vásquez | MV252134 |
| Mario Alejandro Orellana Andrade | OA182314 |
| Rene Gerardo Castillo Monterrosa | CM210922 |
| Juan Diego Rodríguez Somoza | RS221448 |
| David Guillermo Cardona Pérez | CP121738 |

## Descripción del sistema

Sonrisa Digital es un monolito modular full-stack que centraliza la operación
de una clínica dental. Permite gestionar autenticación, usuarios, pacientes,
odontólogos, citas, agenda, historiales clínicos, inventario, proveedores,
reportes y notificaciones según el rol de cada usuario.

### Objetivos de la Etapa 2

- Implementar una aplicación web funcional con React y Next.js.
- Aplicar separación por capas y límites claros entre presentación y negocio.
- Persistir información en MySQL mediante repositorios explícitos.
- Proteger rutas, APIs y operaciones de escritura según roles.
- Validar reglas reales de negocio, especialmente en la gestión de citas.

## Funcionalidades implementadas

### Autenticación y autorización

- Registro de pacientes, inicio y cierre de sesión.
- Sesiones mediante JWT almacenado en cookie segura.
- Middleware para proteger el dashboard.
- Roles: administrador, odontólogo, recepcionista y paciente.
- Permisos de navegación y validaciones de servidor por rol.

### Gestión de citas

- Creación, consulta, confirmación, cancelación, finalización y eliminación.
- Validación de disponibilidad del odontólogo.
- Prevención de choques de agenda considerando duración.
- Lista de espera y notificación cuando se libera un espacio.
- Solo las cuentas de pacientes activas aparecen al registrar una cita.
- Aislamiento de citas para el portal del paciente autenticado.

### Operación clínica

- Dashboard con métricas reales de la base de datos.
- Reportes de citas, ingresos, ocupación y pacientes activos.
- Historiales clínicos asociados a citas completadas.
- Módulos de pacientes, usuarios, inventario y proveedores.
- Tablas con búsqueda, filtros, ordenamiento, paginación y estados visuales.
- Centro de notificaciones con lectura individual y masiva.

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Lenguaje | TypeScript con modo estricto |
| Frontend | React 19, Next.js 15, App Router |
| Estilos | Tailwind CSS 3, componentes reutilizables basados en Radix UI |
| Backend | Route Handlers de Next.js y módulos de dominio en TypeScript |
| Base de datos | MySQL 8 |
| Acceso a datos | mysql2/promise y repositorios explícitos; no se utiliza ORM |
| Validación | Zod |
| Autenticación | JWT mediante jose y cookies HTTP-only |
| Pruebas | Playwright |
| Calidad | ESLint, TypeScript y Prettier |
| Despliegue | Vercel, con MySQL externo |

## Arquitectura

El proyecto utiliza un **monolito modular**. La aplicación se despliega como
una sola unidad, pero cada responsabilidad permanece separada:

~~~text
UI / React
   ↓
Route Handler / API
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
MySQL
~~~

### Reglas arquitectónicas

- Los componentes React no acceden directamente a repositorios.
- Los route handlers adaptan HTTP y delegan la lógica de negocio.
- Los servicios contienen reglas de negocio y orquestación.
- Los repositorios encapsulan consultas y persistencia.
- Backend no depende de páginas ni componentes de presentación.
- shared contiene únicamente tipos y utilidades reutilizables.
- No se agregan microservicios ni una segunda aplicación.

## Estructura del proyecto

~~~text
src/
├── app/                  # Routing, layouts y Route Handlers
├── backend/              # Módulos de negocio, servicios y persistencia
│   ├── database/         # Pool, entidades, mappers, migraciones
│   └── modules/          # Auth, citas, pacientes, reportes, etc.
├── frontend/             # Features, componentes, hooks y clientes API
└── shared/               # Tipos y utilidades puras compartidas

docs/                     # Arquitectura, UI y contribución
tests/                    # Pruebas automatizadas
scripts/                  # Migraciones y tareas de base de datos
~~~

## Requisitos

- Node.js 20 o superior.
- npm.
- MySQL 8 accesible desde el entorno de ejecución.
- Git.

## Instalación local

~~~bash
git clone https://github.com/MiltonMV2025/DPS_PROYECTO.git
cd DPS_PROYECTO
npm install
~~~

Crear el archivo de variables de entorno:

~~~bash
cp .env.example .env.local
~~~

En Windows PowerShell:

~~~powershell
Copy-Item .env.example .env.local
~~~

Aplicar el esquema de base de datos:

~~~bash
npm run db:migrate
~~~

Para cargar datos de demostración, ejecutar el seed de forma explícita:

~~~bash
npm run db:seed -- --confirm-seed
~~~

> El seed utiliza TRUNCATE. No ejecutarlo contra una base con información
> real. El runner bloquea el seed salvo que se confirme intencionalmente.

## Variables de entorno

Configurar estas variables en .env.local y nunca publicar valores reales:

| Variable | Propósito |
|---|---|
| DATABASE_URL | Conexión MySQL, por ejemplo mysql://usuario:clave@localhost:3306/sonrisa_digital |
| AUTH_SECRET | Firma de las sesiones JWT |
| INTERNAL_API_SECRET | Protección de APIs internas de solo lectura |
| INTERNAL_API_BASE_URL | URL base usada para llamadas internas |

Generar un secreto de autenticación:

~~~bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
~~~

## Ejecución y verificación

~~~bash
npm run dev          # Desarrollo en http://localhost:3000
npm run lint         # ESLint
npm run typecheck    # TypeScript estricto
npm run build        # Build de producción
npm run test:ui      # Pruebas Playwright
npm run format:check # Verificación de formato
~~~

Antes de abrir un Pull Request deben pasar lint, typecheck y build.

## Cuentas de demostración

El seed incluye cuentas para validar los diferentes roles. La contraseña de
demostración es Dps2026* únicamente para uso local:

| Correo | Rol |
|---|---|
| claudia.menendez@sonrisaperfecta.sv | Administrador |
| ernesto.rivas@sonrisaperfecta.sv | Odontólogo |
| recepcion@sonrisaperfecta.sv | Recepcionista |
| karla.beltran@gmail.com | Paciente |

## Base de datos

Las migraciones están en src/backend/database/migrations y se registran en
la tabla _migrations. El runner de base de datos no se ejecuta al importar la
aplicación, lo que evita efectos secundarios durante el arranque de Next.js.

Las relaciones principales son:

- Usuarios → Pacientes.
- Pacientes → Citas.
- Usuarios → Citas como odontólogo.
- Citas → Historiales_Clinicos.
- Citas → Notificaciones, Facturacion y Lista_Espera.

## Seguridad y reglas de negocio

- Las contraseñas se almacenan con hash; nunca se guardan en texto plano.
- Las cookies de sesión son HTTP-only.
- Las APIs verifican autenticación y rol en el servidor.
- Las consultas usan parámetros para evitar inyección SQL.
- Los pacientes inactivos no pueden seleccionarse para nuevas citas.
- Las transiciones de estado de una cita están restringidas por reglas explícitas.
- Los secretos y archivos .env* no deben subirse al repositorio.

## Flujo de colaboración

- Crear ramas desde develop.
- Usar nombres feature/*, fix/* o chore/*.
- Mantener commits pequeños y enfocados.
- Abrir Pull Requests hacia develop.
- No realizar commits directamente sobre main.

## Despliegue

La aplicación puede desplegarse en Vercel como un único proyecto Next.js.
Configurar en el entorno de Vercel las mismas variables de producción y usar
una instancia MySQL accesible públicamente. Ejecutar las migraciones de forma
controlada antes de habilitar el tráfico de usuarios.

## Documentación adicional

- [Arquitectura](docs/ARCHITECTURE.md)
- [Componentes de UI](docs/UI_COMPONENTS.md)
- [Guía de contribución](docs/CONTRIBUTING.md)

## Licencia académica

Proyecto desarrollado con fines académicos para la entrega de la Etapa 2.
