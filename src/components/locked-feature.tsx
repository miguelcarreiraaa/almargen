"use client";
import { usePlan, canAccess } from "@/context/plan-context";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import Link from "next/link";

interface LockedFeatureProps {
  requiredPlan: "pro" | "premium";
  children: React.ReactNode;
  className?: string;
}

const PLAN_NAMES = { pro: "Pro", premium: "Premium" };

export function LockedFeature({ requiredPlan, children, className }: LockedFeatureProps) {
  const plan = usePlan();

  if (canAccess(plan, requiredPlan)) return <>{children}</>;

  return (
    <div className={cn("relative rounded-2xl overflow-hidden", className)}>
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-[2px]">
        <div className="text-center px-6 py-6 max-w-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mx-auto mb-3">
            <Lock className="h-5 w-5 text-zinc-500" />
          </div>
          <p className="text-sm font-semibold text-zinc-900 mb-1">
            Función {PLAN_NAMES[requiredPlan]}
          </p>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            Esta función es parte del plan{" "}
            <strong className="text-zinc-700">{PLAN_NAMES[requiredPlan]}</strong>.
            Actualizá tu cuenta para acceder.
          </p>
          <Link
            href="/precios"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </div>
  );
}
