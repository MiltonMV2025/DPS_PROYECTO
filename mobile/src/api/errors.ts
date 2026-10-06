import axios from "axios";

type ApiErrorPayload = { error?: { code?: string; message?: string } };

export function getApiErrorMessage(error: unknown, fallback = "No pudimos completar la solicitud.") {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) return error instanceof Error ? error.message : fallback;
  if (!error.response) return "No pudimos conectarnos con la clínica. Revisá tu conexión.";
  const { status } = error.response;
  if (status === 401) return "Tu sesión expiró. Iniciá sesión nuevamente.";
  if (status === 403) return "Tu cuenta no tiene permisos para realizar esta acción.";
  if (status === 404) return "No encontramos la información solicitada.";
  if (status === 409) return "Ese horario ya no está disponible. Elegí otro.";
  if (status === 400 || status === 422) return error.response.data?.error?.message ?? "Revisá los datos ingresados.";
  if (status >= 500) return "El servicio no está disponible. Intentá nuevamente más tarde.";
  return error.response.data?.error?.message ?? fallback;
}
