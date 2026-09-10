export type ApiResponse<T> = { data: T; message?: string };

export type ApiError = { error: { code: string; message: string } };
export type Paginated<T> = { items: T[]; page: number; pageSize: number; total: number };
