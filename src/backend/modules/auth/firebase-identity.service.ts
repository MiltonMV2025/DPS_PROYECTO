import { ApplicationError } from "@/backend/errors";
import type { AuthRepository } from "./auth.repository";
import { createAuthRepository } from "./auth.repository";
import type { SessionUser } from "./auth.types";
import type { NewGooglePatientAccount } from "./auth.repository";

export type FirebaseIdentity = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  signInProvider: string | null;
};

function isDuplicateEntry(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

function invalidGoogleIdentity(): ApplicationError {
  return new ApplicationError(
    "INVALID_GOOGLE_IDENTITY",
    "No se pudo validar la cuenta de Google.",
    401,
  );
}

export function createFirebaseIdentityService(
  repository: AuthRepository = createAuthRepository(),
) {
  return {
    async registerMobilePatient(
      identity: FirebaseIdentity,
      profile: Omit<NewGooglePatientAccount, "correo" | "firebaseUid">,
    ): Promise<SessionUser> {
      if (
        !identity.uid.trim() ||
        !identity.email?.trim() ||
        !identity.emailVerified ||
        identity.signInProvider !== "google.com"
      ) {
        throw invalidGoogleIdentity();
      }
      const correo = identity.email.trim().toLowerCase();
      const [byEmail, byUid] = await Promise.all([
        repository.findByEmailForFirebase(correo),
        repository.findByFirebaseUid(identity.uid),
      ]);
      if (byEmail || byUid) {
        throw new ApplicationError(
          "GOOGLE_ACCOUNT_ALREADY_EXISTS",
          "Ya existe una cuenta con este correo. Iniciá sesión con Google.",
          409,
        );
      }

      try {
        const id = await repository.createGooglePatientAccount({
          ...profile,
          correo,
          firebaseUid: identity.uid,
        });
        return { id, nombre: profile.nombre, correo, rol: "paciente" };
      } catch (error) {
        if (!isDuplicateEntry(error)) throw error;
        throw new ApplicationError(
          "GOOGLE_ACCOUNT_ALREADY_EXISTS",
          "Ya existe una cuenta con este correo. Iniciá sesión con Google.",
          409,
        );
      }
    },

    async resolveMobilePatient(
      identity: FirebaseIdentity,
    ): Promise<SessionUser> {
      if (
        !identity.uid.trim() ||
        !identity.email?.trim() ||
        !identity.emailVerified ||
        identity.signInProvider !== "google.com"
      ) {
        throw invalidGoogleIdentity();
      }

      let user = await repository.findByFirebaseUid(identity.uid);
      if (!user) {
        user = await repository.findByEmailForFirebase(
          identity.email.trim().toLowerCase(),
        );
        if (!user)
          throw new ApplicationError(
            "GOOGLE_ACCOUNT_NOT_LINKED",
            "No encontramos una cuenta clínica activa con este correo.",
            401,
          );
        if (!user.activo)
          throw new ApplicationError(
            "ACCOUNT_DISABLED",
            "La cuenta está desactivada.",
            403,
          );
        if (user.rol !== "paciente") {
          throw new ApplicationError(
            "MOBILE_ROLE_NOT_ALLOWED",
            "La aplicación Mobile está disponible para cuentas de paciente.",
            403,
          );
        }
        if (user.firebaseUid && user.firebaseUid !== identity.uid) {
          throw new ApplicationError(
            "GOOGLE_ACCOUNT_MISMATCH",
            "Esta cuenta de Google ya está asociada a otro usuario.",
            401,
          );
        }

        if (!user.firebaseUid) {
          try {
            const linked = await repository.linkFirebaseUid(
              user.id,
              identity.uid,
            );
            if (!linked) {
              const linkedUser = await repository.findByFirebaseUid(
                identity.uid,
              );
              if (linkedUser?.id !== user.id) {
                throw new ApplicationError(
                  "GOOGLE_ACCOUNT_MISMATCH",
                  "Esta cuenta de Google ya está asociada a otro usuario.",
                  401,
                );
              }
            }
          } catch (error) {
            if (!isDuplicateEntry(error)) throw error;
            const linkedUser = await repository.findByFirebaseUid(identity.uid);
            if (linkedUser?.id !== user.id) {
              throw new ApplicationError(
                "GOOGLE_ACCOUNT_MISMATCH",
                "Esta cuenta de Google ya está asociada a otro usuario.",
                401,
              );
            }
          }
        }
      }

      if (!user.activo)
        throw new ApplicationError(
          "ACCOUNT_DISABLED",
          "La cuenta está desactivada.",
          403,
        );
      if (user.rol !== "paciente") {
        throw new ApplicationError(
          "MOBILE_ROLE_NOT_ALLOWED",
          "La aplicación Mobile está disponible para cuentas de paciente.",
          403,
        );
      }

      await repository.touchLastAccess(user.id);
      return {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      };
    },
  };
}

export type FirebaseIdentityService = ReturnType<
  typeof createFirebaseIdentityService
>;
