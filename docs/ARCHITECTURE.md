# Arquitectura

Sonrisa Digital es un monolito modular: una sola aplicación Next.js contiene la presentación y los adaptadores de API, mientras que los módulos backend mantienen separadas las responsabilidades de aplicación y persistencia.

## Estructura

- `src/app`: routing, layouts, páginas y Route Handlers de Next.js.
- `src/frontend`: componentes, shell visual, providers, features y clientes de API.
- `src/backend`: módulos de negocio futuros, servicios, repositorios, configuración, errores y persistencia.
- `src/shared`: contratos y utilidades puras verdaderamente compartidos.

## Flujo de solicitudes

`request -> route handler -> controller -> service -> repository -> data source`

Los Route Handlers serán adaptadores HTTP delgados. El controller coordinará la entrada, el service concentrará los casos de uso y el repository encapsulará la persistencia.

## Reglas de dependencia

1. La UI consume clientes o adaptadores de API; nunca repositories directamente.
2. `src/app` compone la aplicación y delega; no contiene lógica de negocio.
3. Backend no depende de componentes, páginas ni código de presentación.
4. `shared` solo contiene piezas sin conocimiento de infraestructura o UI.
5. Los módulos se mantienen delimitados para reducir conflictos entre integrantes.

## Autenticación y autorización

Las sesiones se firman como JWT (`jose`) y viajan en una cookie httpOnly. El
`middleware` protege las rutas del panel; las páginas del servidor usan
`requireModule` para restringir por rol y los Route Handlers de escritura usan
`requireApiUser`/`requireApiRoles`. El estado del usuario se expone a la UI con
Context API (`AuthProvider`). Los permisos por módulo se definen en
`src/frontend/features/auth/permissions.ts`.
