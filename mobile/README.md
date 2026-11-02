# Sonrisa Digital Mobile

Aplicación móvil de Sonrisa Digital construida con React Native, Expo y Expo Router. Permite que pacientes autenticados consulten su información clínica y gestionen solicitudes de citas desde un flujo móvil guiado.

## VIDEO DE ENTREGA

https://youtu.be/_Eg7WFfrVI4?si=FqqUybEVqWwuD88e

## Integrantes

| Estudiante                       | Carné    |
| -------------------------------- | -------- |
| Milton Antonio Mayorga Vásquez   | MV252134 |
| Mario Alejandro Orellana Andrade | OA182314 |
| Rene Gerardo Castillo Monterrosa | CM210922 |
| Juan Diego Rodríguez Somoza      | RS221448 |
| David Guillermo Cardona Pérez    | CP121738 |

## Alcance del Avance 1 — Etapa 3 / Foro 1

La entrega demuestra la primera versión móvil del proyecto y cubre los módulos principales requeridos para React Native.

| Requisito              | Implementación móvil                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Autenticación          | Inicio de sesión con validación de correo y contraseña, tokens JWT, renovación de sesión y cierre de sesión seguro.            |
| Navegación             | Expo Router con rutas públicas/protegidas y navegación por pestañas: Inicio, Mis citas, Agendar, Historial y Perfil.           |
| Módulo de citas        | Consulta, cancelación y solicitud de citas. El flujo de reserva usa un stepper: odontólogo, duración, fecha, horario y motivo. |
| Validaciones y estados | Validaciones de formulario, mensajes de error, estados de carga, estados vacíos y manejo de errores de API.                    |
| Historial y perfil     | Consulta del historial clínico y datos personales del paciente.                                                                |
| Diseño reutilizable    | Componentes base reutilizables para pantallas, tarjetas, botones, alertas, cargas y estados vacíos.                            |

> La app móvil consume la API REST existente de Next.js. Google/Firebase valida la identidad; MySQL sigue siendo la fuente de verdad de usuarios, roles e historial. La app no accede directamente a MySQL. Firestore queda fuera de esta fase.

## Flujo de reserva de cita

1. El paciente selecciona un odontólogo activo.
2. Selecciona duración y fecha.
3. La app consulta únicamente los horarios disponibles del odontólogo elegido.
4. El paciente selecciona el horario, agrega el motivo y envía la solicitud.
5. Puede retroceder entre pasos para modificar una elección sin reiniciar el flujo.

## Ejecutar el proyecto

### Requisitos

- Node.js y npm.
- Development build de Expo y emulador/dispositivo Android o iOS. Google Sign-In y React Native Firebase no funcionan en Expo Go.
- Una API de Sonrisa Digital disponible localmente o en Vercel.
- Un proyecto Firebase configurado con Google como proveedor de Authentication.

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

### Configurar Google y Firebase

1. En Firebase Console, creá el proyecto y habilitá Authentication → Google.
2. Registrá Android como com.sonrisadigital.mobile; si vas a probar iOS, registralo como com.sonrisadigital.mobile.
3. Agregá la huella SHA-1 del certificado de desarrollo Android en la configuración de la app Firebase.
4. Descargá google-services.json y, si corresponde, GoogleService-Info.plist en mobile/. Los archivos están ignorados por Git; no los subas.
5. En el backend local y en el entorno desplegado, configurá FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY como secretos del servidor. La clave privada se guarda en una sola línea con saltos escapados como \n. Nunca uses estas variables con EXPO_PUBLIC_ ni las copies a la app móvil.
6. Aplicá la migración 007_firebase_auth.sql antes de habilitar el endpoint de Google. La migración agrega un UID nullable y único; los usuarios actuales no cambian hasta vincularse por primera vez con un correo Google verificado.

El acceso Google solo se vincula a un usuario paciente activo que ya exista en la clínica. No crea cuentas ni asigna roles. El login existente con correo/contraseña sigue disponible.

### Crear y ejecutar una development build

Después de agregar los archivos Firebase:

    cd mobile
    npx.cmd expo prebuild
    npx.cmd expo run:android
    npx.cmd expo start --dev-client

Para iOS, generá la development build desde macOS o EAS Build.

### Inicio en Expo Go

Expo Go se mantiene disponible solo para desarrollo de pantallas que no requieran los módulos nativos de Firebase/Google. Para probar autenticación Google, abrí el proyecto desde la development build instalada.

## Verificación técnica

```powershell
npm.cmd run typecheck
```

El backend debe tener MOBILE_AUTH_SECRET, las credenciales privadas de Firebase Admin y las migraciones aplicadas para admitir sesiones y el inicio de sesión Google.

## Evidencia para la entrega

- Repositorio GitHub con este proyecto.
- Video demostrativo de máximo 15 minutos: login, navegación, reserva de cita, historial y perfil.
- Documento PDF en formato APA 7 sobre React Native y Figma aplicados al proyecto, con capturas y justificación de decisiones UX/UI.

## Pendiente de la entrega

La consigna también solicita registro funcional. Actualmente el módulo móvil contiene inicio de sesión; el registro debe agregarse o documentarse como parte pendiente antes de presentar la entrega final del avance.
