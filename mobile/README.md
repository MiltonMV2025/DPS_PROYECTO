# Sonrisa Digital Mobile

Aplicación móvil de Sonrisa Digital construida con React Native, Expo y Expo Router. Permite que pacientes autenticados consulten su información clínica y gestionen solicitudes de citas desde un flujo móvil guiado.

## VIDEO DE ENTREGA
https://youtu.be/_Eg7WFfrVI4?si=FqqUybEVqWwuD88e

## Integrantes

| Estudiante | Carné |
|---|---|
| Milton Antonio Mayorga Vásquez | MV252134 |
| Mario Alejandro Orellana Andrade | OA182314 |
| Rene Gerardo Castillo Monterrosa | CM210922 |
| Juan Diego Rodríguez Somoza | RS221448 |
| David Guillermo Cardona Pérez | CP121738 |

## Alcance del Avance 1 — Etapa 3 / Foro 1

La entrega demuestra la primera versión móvil del proyecto y cubre los módulos principales requeridos para React Native.

| Requisito | Implementación móvil |
|---|---|
| Autenticación | Inicio de sesión con validación de correo y contraseña, tokens JWT, renovación de sesión y cierre de sesión seguro. |
| Navegación | Expo Router con rutas públicas/protegidas y navegación por pestañas: Inicio, Mis citas, Agendar, Historial y Perfil. |
| Módulo de citas | Consulta, cancelación y solicitud de citas. El flujo de reserva usa un stepper: odontólogo, duración, fecha, horario y motivo. |
| Validaciones y estados | Validaciones de formulario, mensajes de error, estados de carga, estados vacíos y manejo de errores de API. |
| Historial y perfil | Consulta del historial clínico y datos personales del paciente. |
| Diseño reutilizable | Componentes base reutilizables para pantallas, tarjetas, botones, alertas, cargas y estados vacíos. |

> La app móvil consume la API REST existente de Next.js. MySQL sigue siendo la fuente de verdad; la app no se conecta directamente a MySQL ni a Firebase.

## Flujo de reserva de cita

1. El paciente selecciona un odontólogo activo.
2. Selecciona duración y fecha.
3. La app consulta únicamente los horarios disponibles del odontólogo elegido.
4. El paciente selecciona el horario, agrega el motivo y envía la solicitud.
5. Puede retroceder entre pasos para modificar una elección sin reiniciar el flujo.

## Ejecutar el proyecto

### Requisitos

- Node.js y npm.
- Expo Go o emulador Android/iOS.
- Una API de Sonrisa Digital disponible localmente o en Vercel.

### Configuración

```powershell
cd mobile
npm.cmd install
Copy-Item .env.example .env
```

En `mobile/.env`, configurá la URL pública de la API:

```env
EXPO_PUBLIC_API_URL=https://dps-proyecto.vercel.app
```

Para desarrollo local en Android Emulator:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### Inicio

```powershell
npx.cmd expo start -c
```

## Verificación técnica

```powershell
npm.cmd run typecheck
```

El backend debe estar desplegado con las variables de entorno y migraciones correspondientes, incluyendo `MOBILE_AUTH_SECRET`, para que el inicio de sesión y las sesiones móviles funcionen.

## Evidencia para la entrega

- Repositorio GitHub con este proyecto.
- Video demostrativo de máximo 15 minutos: login, navegación, reserva de cita, historial y perfil.
- Documento PDF en formato APA 7 sobre React Native y Figma aplicados al proyecto, con capturas y justificación de decisiones UX/UI.

## Pendiente de la entrega

La consigna también solicita registro funcional. Actualmente el módulo móvil contiene inicio de sesión; el registro debe agregarse o documentarse como parte pendiente antes de presentar la entrega final del avance.
