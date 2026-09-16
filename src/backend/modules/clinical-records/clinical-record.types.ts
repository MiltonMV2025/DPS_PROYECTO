/** Domain contracts for clinical records. */
export type { ClinicalRecord as ClinicalRecordTypes } from "@/backend/database/entities";
export type CompletionRecordInput = { idCita: number; observaciones: string; receta: string | null; recomendaciones: string | null };
