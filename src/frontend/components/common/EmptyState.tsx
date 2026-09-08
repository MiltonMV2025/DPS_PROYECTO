"use client";

import { Lottie } from "lottie-react";
import { SearchX } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description = "Prueba con otros filtros o términos de búsqueda.", action }: EmptyStateProps) {
  const [animationReady, setAnimationReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/animations/empty-search.json", { method: "HEAD" })
      .then((response) => { if (active) setAnimationReady(response.ok); })
      .catch(() => { if (active) setAnimationReady(false); });
    return () => { active = false; };
  }, []);

  return <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center" role="status" aria-live="polite">
    {animationReady && !reducedMotion ? <Lottie src="/animations/empty-search.json" loop autoplay aria-hidden="true" className="h-28 w-28" /> : <SearchX aria-hidden="true" className="h-12 w-12 text-primary" />}
    <div><h3 className="font-semibold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-600">{description}</p>{action}</div>
  </div>;
}
