"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Upload, Settings, TrendingUp, CreditCard, ShoppingBag, Lock, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { usePlan, canAccess, type PlanType } from "@/context/plan-context";

const PLAN_LABELS: Record<PlanType, string> = { free: "Gratis", pro: "Pro", estudio: "Estudio" };
const PLAN_COLORS: Record<PlanType, string> = {
  free: "text-zinc-500",
  pro: "text-blue-400",
  estudio: "text-emerald-400",
};

const navItems: {
  href: string;
  label: string;
  icon: React.ElementType;
  requiredPlan: "pro" | null;
}[] = [
  { href: "/dashboard",                   label: "Dashboard",     icon: BarChart2,   requiredPlan: null      },
  { href: "/dashboard/cargar",            label: "Cargar datos",  icon: Upload,      requiredPlan: null      },
  { href: "/dashboard/proyeccion",        label: "Proyección",    icon: TrendingUp,  requiredPlan: "pro"     },
  { href: "/dashboard/simulador-compras", label: "Sim. compras",  icon: ShoppingBag, requiredPlan: "pro"     },
  { href: "/dashboard/configuracion",     label: "Configuración", icon: Settings,    requiredPlan: null      },
  { href: "/dashboard/billing",           label: "Suscripción",   icon: CreditCard,  requiredPlan: null      },
];

function isLocked(plan: PlanType, required: "pro" | null): boolean {
  if (!required) return false;
  return !canAccess(plan, required);
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const plan = usePlan();
  const { user } = useUser();
  const displayName = user?.firstName ?? user?.username ?? "Mi cuenta";

  return (
    <aside className="flex flex-col w-60 h-screen bg-zinc-900 text-zinc-100 px-4 py-6 shrink-0">
      <div className="mb-8 px-2 flex items-start justify-between">
        <Link href="/" className="block" onClick={onClose}>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Al<span className="text-emerald-400">Margen</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Semáforo de monotributo</p>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, requiredPlan }) => {
          const locked = isLocked(plan, requiredPlan);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {locked && <Lock className="h-3 w-3 opacity-40 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 px-2 border-t border-zinc-700 flex items-center gap-3">
        <UserButton />
        <div className="min-w-0">
          <p className="text-xs text-zinc-300 font-medium truncate">{displayName}</p>
          <p className={`text-xs font-medium ${PLAN_COLORS[plan]}`}>{PLAN_LABELS[plan]}</p>
        </div>
      </div>
    </aside>
  );
}
