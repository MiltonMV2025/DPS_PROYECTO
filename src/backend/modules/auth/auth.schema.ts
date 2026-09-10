import { z } from "zod";

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Za-z]/, "La contraseña debe incluir una letra")
  .regex(/[0-9]/, "La contraseña debe incluir un número");

export const registerSchema = z.object({
  nombre: z.string().trim().min(3, "Ingresá tu nombre completo").max(120),
  correo: z.string().trim().toLowerCase().email("Correo inválido").max(150),
  password,
  telefono: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,20}$/, "Teléfono inválido"),
  fechaNacimiento: z
    .string()
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date < new Date();
    }, "Fecha de nacimiento inválida"),
});

export const loginSchema = z.object({
  correo: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
