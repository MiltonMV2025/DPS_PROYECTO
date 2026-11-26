import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ApplicationError } from "@/backend/errors";
import type { FirebaseIdentity } from "./firebase-identity.service";

const APP_NAME = "sonrisa-digital-auth";
const INVALID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/user-disabled",
]);

function getFirebaseAuth() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured");
  }

  const existing = getApps().find((app) => app.name === APP_NAME);
  const app =
    existing ??
    initializeApp(
      {
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      },
      APP_NAME,
    );
  return getAuth(app);
}

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<FirebaseIdentity> {
  const auth = getFirebaseAuth();
  try {
    const decoded = await auth.verifyIdToken(idToken, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified === true,
      signInProvider: decoded.firebase?.sign_in_provider ?? null,
    };
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";
    if (INVALID_TOKEN_CODES.has(code)) {
      throw new ApplicationError(
        "INVALID_GOOGLE_IDENTITY",
        "No se pudo validar la cuenta de Google.",
        401,
      );
    }
    throw error;
  }
}
