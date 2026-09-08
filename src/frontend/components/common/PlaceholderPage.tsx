import Link from "next/link";
import { Button } from "@/frontend/components/ui/button";
type PlaceholderPageProps = { title: string; description: string };
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm sm:p-8">
      <p className="mb-2 text-sm font-medium text-primary">
        Sonrisa Digital
      </p>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-slate-600">{description}</p>
      <div className="mt-8 rounded-lg bg-primary-light p-4">
        <h2 className="font-medium text-primary">Próximamente</h2>
        <p className="mt-1 text-sm text-slate-600">
          Esta sección aún no está disponible. Puedes consultar la agenda de
          demostración.
        </p>
      </div>
      <Button asChild className="mt-6">
        <Link href="/citas">Ver agenda</Link>
      </Button>
    </section>
  );
}
