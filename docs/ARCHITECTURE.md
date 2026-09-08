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

La autenticación, autorización, ORM y modelo de datos se incorporarán en etapas posteriores.
