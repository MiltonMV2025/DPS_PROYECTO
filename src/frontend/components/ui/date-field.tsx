"use client";

import { Input, type InputProps } from "./input";

export function DateField({ min = "1900-01-01", max = new Date().toISOString().slice(0, 10), ...props }: InputProps) {
  return <Input {...props} type="date" min={min} max={max} />;
}
