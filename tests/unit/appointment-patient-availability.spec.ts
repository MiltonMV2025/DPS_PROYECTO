import { expect, test } from "@playwright/test";
import { createAppointmentWriteRepository } from "../../src/backend/modules/appointments/appointment.repository";

type QueryCall = { sql: string; params?: unknown[] };

function createQuerySpy(results: unknown[]) {
  const calls: QueryCall[] = [];
  let index = 0;
  const pool = {
    async query(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return [results[index++]];
    },
  };
  return { calls, pool };
}

test("patient options only include patients with active user accounts", async () => {
  const { calls, pool } = createQuerySpy([[{ id: 2, name: "Paciente activo" }]]);
  const repository = createAppointmentWriteRepository(pool as never);

  await expect(repository.listPatientOptions()).resolves.toEqual([{ id: 2, name: "Paciente activo" }]);
  expect(calls[0].sql).toContain("WHERE u.activo = TRUE");
});

test("patient existence validation only accepts active user accounts", async () => {
  const { calls, pool } = createQuerySpy([[{ total: 0 }]]);
  const repository = createAppointmentWriteRepository(pool as never);

  await expect(repository.patientExists(7)).resolves.toBe(false);
  expect(calls[0].sql).toContain("p.id_paciente = ? AND u.activo = TRUE");
  expect(calls[0].params).toEqual([7]);
});
