import { api } from "./client";
import type { ClinicalRecord } from "@/types/api";

export async function listClinicalRecords() {
  const response = await api.get<{ data: ClinicalRecord[] }>("/api/v1/me/clinical-records");
  return response.data.data;
}
