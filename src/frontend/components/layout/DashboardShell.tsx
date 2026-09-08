"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Stethoscope,
  Truck,
  Users,
  UserRoundCog,
  ChartNoAxesCombined,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/frontend/components/ui/sheet";
import { cn } from "@/frontend/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Citas", href: "/citas", icon: CalendarDays },
  { label: "Pacientes", href: "/pacientes", icon: Users },
  { label: "Historiales", href: "/historiales", icon: ClipboardList },
  { label: "Inventario", href: "/inventario", icon: Package },
  { label: "Reportes", href: "/reportes", icon: ChartNoAxesCombined },
  { label: "Usuarios", href: "/usuarios", icon: UserRoundCog },
  { label: "Proveedores", href: "/proveedores", icon: Truck },
];

function Navigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación principal" className="space-y-1">
      {navigation.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={pathname === href ? "page" : undefined}
          title={collapsed ? label : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-primary text-primary-foreground"
              : "text-slate-600 hover:bg-primary-light hover:text-primary",
            collapsed && "justify-center px-0",
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span className={collapsed ? "sr-only" : undefined}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function DashboardShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <aside
        aria-label="Barra lateral"
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-white p-4 lg:flex",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <Link
          href="/"
          aria-label="Sonrisa Digital, inicio"
          className="mb-8 flex h-10 items-center gap-3 rounded-md text-primary"
        >
          <Stethoscope aria-hidden="true" className="h-8 w-8 shrink-0" />
          <span className={cn("text-lg font-bold", collapsed && "sr-only")}>
            Sonrisa Digital
          </span>
        </Link>
        <div id="desktop-navigation" className="min-h-0 flex-1 overflow-y-auto">
          <Navigation collapsed={collapsed} />
        </div>
        <Button
          variant="ghost"
          className="mt-4 w-full"
          aria-expanded={!collapsed}
          aria-controls="desktop-navigation"
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" className="h-5 w-5" />
              <span>Contraer menú</span>
            </>
          )}
        </Button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center gap-3 border-b bg-white px-4 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu aria-hidden="true" className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(20rem,90vw)] bg-white p-4"
            >
              <SheetHeader className="mb-8 pr-10 text-left">
                <SheetTitle>Sonrisa Digital</SheetTitle>
                <SheetDescription>Navegación de la clínica</SheetDescription>
              </SheetHeader>
              <Navigation onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-slate-700">
            Panel administrativo
          </span>
          <span className="ml-auto hidden text-sm text-slate-600 sm:block">
            Sonrisa Digital
          </span>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full min-w-0 p-4 sm:p-6 xl:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
