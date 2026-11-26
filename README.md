# Sonrisa Digital

Sistema web de gestión para la clínica dental Sonrisa Perfecta, construido con
Next.js (App Router) y MySQL. Este proyecto corresponde a la **Actividad 4 —
Entrega final** de la asignatura DPS941.

## Entrega académica

| Campo | Información |
|---|---|
| Actividad | Actividad 4 |
| Entrega | Final |
| Video de entrega final | _https://youtu.be/chpuar17Jj0_ |

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

Consultar `.env.example`. No agregar secretos reales al repositorio.

- `DATABASE_URL`: connection string MySQL con el formato
  `mysql://username:password@host:3306/database_name`. Las credenciales deben
  estar codificadas como URL si contienen caracteres reservados. El pool se crea
  de forma lazy en `src/backend/database/pool.ts`.
- `AUTH_SECRET`: secreto usado para firmar los tokens de sesión. Generar uno con
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- `MOBILE_AUTH_SECRET`: secreto independiente para los access tokens Bearer de Mobile.
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

La aplicación se despliega en Vercel. Configurar `DATABASE_URL`, `AUTH_SECRET`,
`INTERNAL_API_SECRET` e `INTERNAL_API_BASE_URL` (la URL pública del despliegue)
como variables de entorno del proyecto.
## Soporte Mobile

El repositorio mantiene una única API Next.js para Web y Mobile:

```text
Web    -- cookie JWT --> Route Handlers --> MySQL
Mobile -- Bearer JWT --> Route Handlers --> MySQL
```

La autenticación Mobile usa access tokens de corta duración y refresh tokens
opacos rotatorios persistidos como hash en `Sesiones_Mobile`. La autenticación
Web basada en `sonrisa_session` permanece separada.

La aplicación Expo está en `mobile/` y usa su propio `package.json`. Para
prepararla localmente:

```powershell
cd mobile
npm install
Copy-Item .env.example .env
npx expo start
```

Configurar `EXPO_PUBLIC_API_URL` con la URL pública de la API. Los secretos
`DATABASE_URL`, `AUTH_SECRET`, `MOBILE_AUTH_SECRET` e `INTERNAL_API_SECRET`
son exclusivos del backend.

Mobile puede registrar tokens de dispositivo mediante
`POST /api/v1/notifications/devices`. Firebase/Expo Notifications se utiliza
únicamente para push; MySQL continúa siendo la fuente de verdad y no se usa
Firestore.
