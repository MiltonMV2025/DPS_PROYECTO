import { parseInput } from "@/backend/utils";
import { createDeviceTokenRepository, type DeviceTokenRepository } from "./device-token.repository";
import { deviceTokenSchema } from "./device-token.schema";

export function createDeviceTokenService(repository: DeviceTokenRepository = createDeviceTokenRepository()) {
  return {
    register(userId: number, raw: unknown) {
      const input = parseInput(deviceTokenSchema, raw);
      return repository.upsert(userId, input.token, input.platform);
    },
    remove(userId: number, raw: unknown) {
      const input = parseInput(deviceTokenSchema.pick({ token: true }), raw);
      return repository.remove(userId, input.token);
    },
  };
}

export type DeviceTokenService = ReturnType<typeof createDeviceTokenService>;
