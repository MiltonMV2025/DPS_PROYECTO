import { expect, test } from "@playwright/test";
import { createFirebaseIdentityService } from "../../src/backend/modules/auth/firebase-identity.service";
import { createAuthRepository } from "../../src/backend/modules/auth/auth.repository";
import { createMobileAuthService } from "../../src/backend/modules/auth/mobile-auth.service";
import { createAuthService } from "../../src/backend/modules/auth/auth.service";

type UserRecord = {
  id: number;
  nombre: string;
  correo: string;
  rol: "paciente" | "administrador";
  passwordHash: string;
  activo: boolean;
  firebaseUid: string | null;
};

const patient = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  id: 14,
  nombre: "Ada Paciente",
  correo: "ada@example.test",
  rol: "paciente",
  passwordHash: "not-used",
  activo: true,
  firebaseUid: null,
  ...overrides,
});

function createRepository(
  user: UserRecord | null,
  uidUser: UserRecord | null = null,
) {
  const calls = {
    email: [] as string[],
    uid: [] as string[],
    links: [] as Array<[number, string]>,
    touches: [] as number[],
  };
  let firebaseUser = uidUser;
  return {
    calls,
    repository: {
      async findByEmailForFirebase(email: string) {
        calls.email.push(email);
        return user;
      },
      async findByFirebaseUid(uid: string) {
        calls.uid.push(uid);
        return firebaseUser;
      },
      async linkFirebaseUid(userId: number, uid: string) {
        calls.links.push([userId, uid]);
        if (user?.id !== userId || user.firebaseUid !== null) return false;
        user.firebaseUid = uid;
        firebaseUser = user;
        return true;
      },
      async touchLastAccess(userId: number) {
        calls.touches.push(userId);
      },
    },
  };
}

const identity = {
  uid: "firebase-uid-123",
  email: "ADA@example.test",
  emailVerified: true,
  signInProvider: "google.com",
};

test("links a verified Google identity to an existing active patient and updates last access", async () => {
  const { calls, repository } = createRepository(patient());
  const service = createFirebaseIdentityService(repository as never);

  await expect(service.resolveMobilePatient(identity)).resolves.toEqual({
    id: 14,
    nombre: "Ada Paciente",
    correo: "ada@example.test",
    rol: "paciente",
  });
  expect(calls.email).toEqual(["ada@example.test"]);
  expect(calls.links).toEqual([[14, "firebase-uid-123"]]);
  expect(calls.touches).toEqual([14]);
});

test("password login repository query remains compatible before the Firebase UID migration", async () => {
  const queries: string[] = [];
  const pool = {
    async query(sql: string) {
      queries.push(sql);
      return [
        [
          {
            id_usuario: 14,
            nombre: "Ada",
            correo: "ada@example.test",
            rol: "paciente",
            password_hash: "hash",
            activo: 1,
          },
        ],
      ];
    },
  };
  const repository = createAuthRepository(pool as never);

  await repository.findByEmail("ada@example.test");
  await repository.findByEmailForFirebase("ada@example.test");

  expect(queries[0]).not.toContain("firebase_uid");
  expect(queries[1]).toContain("firebase_uid");
});

test("rejects an unverified Google email without looking up or linking an account", async () => {
  const { calls, repository } = createRepository(patient());
  const service = createFirebaseIdentityService(repository as never);

  await expect(
    service.resolveMobilePatient({ ...identity, emailVerified: false }),
  ).rejects.toMatchObject({ code: "INVALID_GOOGLE_IDENTITY" });
  expect(calls.email).toEqual([]);
  expect(calls.links).toEqual([]);
});

test("rejects Firebase identities authenticated by a non-Google provider", async () => {
  const { calls, repository } = createRepository(patient());
  const service = createFirebaseIdentityService(repository as never);

  await expect(
    service.resolveMobilePatient({ ...identity, signInProvider: "password" }),
  ).rejects.toMatchObject({ code: "INVALID_GOOGLE_IDENTITY" });
  expect(calls.email).toEqual([]);
  expect(calls.links).toEqual([]);
});

test("rejects unknown or inactive accounts without assigning a mobile identity", async () => {
  const missing = createRepository(null);
  const missingService = createFirebaseIdentityService(
    missing.repository as never,
  );
  await expect(
    missingService.resolveMobilePatient(identity),
  ).rejects.toMatchObject({ code: "GOOGLE_ACCOUNT_NOT_LINKED" });
  expect(missing.calls.links).toEqual([]);

  const inactive = createRepository(patient({ activo: false }));
  const inactiveService = createFirebaseIdentityService(
    inactive.repository as never,
  );
  await expect(
    inactiveService.resolveMobilePatient(identity),
  ).rejects.toMatchObject({ code: "ACCOUNT_DISABLED" });
  expect(inactive.calls.links).toEqual([]);
});

test("rejects non-patient users and identities already linked elsewhere", async () => {
  const staff = createRepository(patient({ rol: "administrador" }));
  const staffService = createFirebaseIdentityService(staff.repository as never);
  await expect(
    staffService.resolveMobilePatient(identity),
  ).rejects.toMatchObject({ code: "MOBILE_ROLE_NOT_ALLOWED" });
  expect(staff.calls.links).toEqual([]);

  const linkedElsewhere = createRepository(
    patient({ firebaseUid: "another-uid" }),
  );
  const linkedService = createFirebaseIdentityService(
    linkedElsewhere.repository as never,
  );
  await expect(
    linkedService.resolveMobilePatient(identity),
  ).rejects.toMatchObject({ code: "GOOGLE_ACCOUNT_MISMATCH" });
  expect(linkedElsewhere.calls.links).toEqual([]);
});

test("reuses the existing UID link even if the Google email later changes", async () => {
  const linked = patient({ firebaseUid: "firebase-uid-123" });
  const { calls, repository } = createRepository(null, linked);
  const service = createFirebaseIdentityService(repository as never);

  await expect(
    service.resolveMobilePatient({
      ...identity,
      email: "new-address@example.test",
    }),
  ).resolves.toMatchObject({ id: 14, rol: "paciente" });
  expect(calls.email).toEqual([]);
  expect(calls.links).toEqual([]);
  expect(calls.touches).toEqual([14]);
});

test("Google login issues the same mobile session response after Firebase identity verification", async () => {
  process.env.MOBILE_AUTH_SECRET =
    "test-mobile-auth-secret-at-least-32-characters";
  const sessions: Array<{
    userId: number;
    familyToken: string;
    tokenHash: string;
    expiresAt: Date;
  }> = [];
  const firebaseIdentityService = {
    async resolveMobilePatient() {
      return {
        id: 14,
        nombre: "Ada Paciente",
        correo: "ada@example.test",
        rol: "paciente" as const,
      };
    },
  };
  const service = createMobileAuthService(
    {} as never,
    {
      async create(input: (typeof sessions)[number]) {
        sessions.push(input);
        return sessions.length;
      },
    } as never,
    firebaseIdentityService as never,
    async (idToken) => {
      expect(idToken).toBe("firebase-id-token");
      return {
        uid: identity.uid,
        email: identity.email,
        emailVerified: identity.emailVerified,
        signInProvider: identity.signInProvider,
      };
    },
  );

  const response = await service.loginWithFirebase("firebase-id-token");
  expect(response).toMatchObject({
    tokenType: "Bearer",
    expiresIn: 900,
    user: { id: 14, rol: "paciente" },
  });
  expect(response.accessToken).toBeTruthy();
  expect(response.refreshToken).toBeTruthy();
  expect(sessions).toHaveLength(1);
  expect(sessions[0].userId).toBe(14);
  expect(sessions[0].tokenHash).not.toBe(response.refreshToken);
});

test("Firebase verification failure does not create a mobile session", async () => {
  const sessions: unknown[] = [];
  const firebaseIdentityService = {
    async resolveMobilePatient() {
      throw new Error("should not resolve identity");
    },
  };
  const service = createMobileAuthService(
    {} as never,
    {
      async create(input: unknown) {
        sessions.push(input);
        return sessions.length;
      },
    } as never,
    firebaseIdentityService as never,
    async () => {
      throw new Error("invalid token");
    },
  );

  await expect(service.loginWithFirebase("bad-token")).rejects.toThrow(
    "invalid token",
  );
  expect(sessions).toHaveLength(0);
});

test("Google registration creates one patient from verified identity and profile only", async () => {
  const created: unknown[] = [];
  const repository = {
    async findByEmailForFirebase() { return null; },
    async findByFirebaseUid() { return null; },
    async createGooglePatientAccount(input: unknown) {
      created.push(input);
      return 41;
    },
  };
  const service = createFirebaseIdentityService(repository as never);
  await expect(service.registerMobilePatient(identity, {
    nombre: "Ada Lovelace", telefono: "555-1234", fechaNacimiento: "1990-01-01",
  })).resolves.toEqual({ id: 41, nombre: "Ada Lovelace", correo: "ada@example.test", rol: "paciente" });
  expect(created).toEqual([{
    nombre: "Ada Lovelace", telefono: "555-1234", fechaNacimiento: "1990-01-01",
    correo: "ada@example.test", firebaseUid: identity.uid,
  }]);
});

test("Google registration rejects invalid provider/email and duplicate identities before creation", async () => {
  const created: unknown[] = [];
  const repository = {
    async findByEmailForFirebase() { return null; },
    async findByFirebaseUid() { return null; },
    async createGooglePatientAccount(input: unknown) { created.push(input); return 1; },
  };
  const service = createFirebaseIdentityService(repository as never);
  await expect(service.registerMobilePatient({ ...identity, emailVerified: false }, {
    nombre: "Ada Lovelace", telefono: "555-1234", fechaNacimiento: "1990-01-01",
  })).rejects.toMatchObject({ code: "INVALID_GOOGLE_IDENTITY" });
  await expect(service.registerMobilePatient({ ...identity, signInProvider: "password" }, {
    nombre: "Ada Lovelace", telefono: "555-1234", fechaNacimiento: "1990-01-01",
  })).rejects.toMatchObject({ code: "INVALID_GOOGLE_IDENTITY" });
  expect(created).toHaveLength(0);

  const duplicate = createFirebaseIdentityService({
    async findByEmailForFirebase() { return patient(); },
    async findByFirebaseUid() { return null; },
    async createGooglePatientAccount(input: unknown) { created.push(input); return 1; },
  } as never);
  await expect(duplicate.registerMobilePatient(identity, {
    nombre: "Ada Lovelace", telefono: "555-1234", fechaNacimiento: "1990-01-01",
  })).rejects.toMatchObject({ code: "GOOGLE_ACCOUNT_ALREADY_EXISTS", status: 409 });
  expect(created).toHaveLength(0);
});

test("passwordless Google accounts are rejected by web password login", async () => {
  const service = createAuthService({
    async findByEmail() { return { ...patient(), passwordHash: null }; },
    async touchLastAccess() { throw new Error("should not update access"); },
  } as never);
  await expect(service.login({ correo: "ada@example.test", password: "Password123" }))
    .rejects.toMatchObject({ code: "INVALID_CREDENTIALS", status: 401 });
});

test("Google patient creation rolls back both records when patient profile insertion fails", async () => {
  const queries: string[] = [];
  const connection = {
    async beginTransaction() { queries.push("BEGIN"); },
    async query(sql: string) {
      queries.push(sql);
      if (sql.includes("INSERT INTO Pacientes")) throw new Error("profile insert failed");
      return [{ insertId: 51 }];
    },
    async commit() { queries.push("COMMIT"); },
    async rollback() { queries.push("ROLLBACK"); },
    release() { queries.push("RELEASE"); },
  };
  const repository = createAuthRepository({
    getConnection: async () => connection,
  } as never);
  await expect(repository.createGooglePatientAccount({
    nombre: "Ada Lovelace", correo: "ada@example.test", telefono: "555-1234",
    fechaNacimiento: "1990-01-01", firebaseUid: identity.uid,
  })).rejects.toThrow("profile insert failed");
  expect(queries).toContain("ROLLBACK");
  expect(queries).not.toContain("COMMIT");
  expect(queries).toContain("RELEASE");
});

test("mobile Google registration verifies token before issuing standard session", async () => {
  process.env.MOBILE_AUTH_SECRET = "test-mobile-auth-secret-at-least-32-characters";
  const createdSessions: unknown[] = [];
  let verifiedToken = "";
  const identityService = {
    async registerMobilePatient(_identity: unknown, profile: unknown) {
      expect(profile).toEqual({
        nombre: "Ada Lovelace", telefono: "555-1234", fechaNacimiento: "1990-01-01",
      });
      return { id: 51, nombre: "Ada Lovelace", correo: "ada@example.test", rol: "paciente" as const };
    },
  };
  const service = createMobileAuthService(
    {} as never,
    { async create(input: unknown) { createdSessions.push(input); return 1; } } as never,
    identityService as never,
    async (idToken) => {
      verifiedToken = idToken;
      return identity;
    },
  );
  const result = await service.registerWithGoogle({
    idToken: "verified-token", nombre: "Ada Lovelace", telefono: "555-1234",
    fechaNacimiento: "1990-01-01",
  });
  expect(verifiedToken).toBe("verified-token");
  expect(result).toMatchObject({ user: { id: 51, rol: "paciente" }, tokenType: "Bearer" });
  expect(createdSessions).toHaveLength(1);
});
