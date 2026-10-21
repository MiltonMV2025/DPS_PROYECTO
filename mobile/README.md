# Sonrisa Digital Mobile

Expo Router application that consumes the existing Next.js REST API. MySQL
remains the source of truth; this app does not connect to MySQL or Firestore.

## Setup

```powershell
npm install
Copy-Item .env.example .env
npx expo start
```

Set `EXPO_PUBLIC_API_URL` to the deployed Next.js URL. Push notifications need
native Android/iOS credentials and a development build; local development can
continue without them.
