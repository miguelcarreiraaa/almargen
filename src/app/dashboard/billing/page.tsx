"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Shield,
  Star,
  Loader2,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PlanType = "free" | "pro" | "premium";

interface BillingInfo {
  plan_type: PlanType;
  status: string;
  mp_preapproval_id: string | null;
  trial_ends_at: string | null;
}

const PLAN_INFO = {
  free: {
    label: "Free",
    icon: null,
    color: "text-zinc-500",
    bg: "bg-zinc-100",
    description: "Simulador básico, sin registro.",
  },
  pro: {
    label: "Pro",
    icon: Shield,
    color: "text-zinc-700",
    bg: "bg-zinc-100",
    description: "Dashboard completo, proyección, alertas.",
  },
  premium: {
    label: "Premium",
    icon: Star,
    color: "text-zinc-900",
    bg: "bg-zinc-200",
    description: "Modo Blindaje — el máximo nivel de protección.",
  },
};

function calcularDiasRestantes(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutSuccess = searchParams.get("checkout") === "success";

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => r.json())
      .then((d) => setBilling(d))
      .finally(() => setLoadingBilling(false));
  }, []);

  async function handleCancelar() {
    setLoadingCancel(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess(true);
        setBilling((prev) =>
          prev ? { ...prev, plan_type: "free", mp_preapproval_id: null, trial_ends_at: null } : prev
        );
        setConfirmCancel(false);
      } else {
        alert(data.error ?? "Error al cancelar");
      }
    } catch {
      alert("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoadingCancel(false);
    }
  }

  const plan = billing?.plan_type ?? "free";
  const isPaid = plan !== "free";
  const PlanIcon = PLAN_INFO[plan].icon;
  const diasRestantes = calcularDiasRestantes(billing?.trial_ends_at ?? null);
  const enTrial = diasRestantes !== null && diasRestantes > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Suscripción</h1>
        <p className="text-sm text-zinc-500 mt-1">Administrá tu plan y período de prueba.</p>
      </div>

      {/* Success banners */}
      {checkoutSuccess && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">¡Prueba iniciada!</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Tenés 7 días gratis. El primer cobro se realizará recién al 8° día.
            </p>
          </div>
        </div>
      )}

      {cancelSuccess && (
        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-zinc-800">Suscripción cancelada</p>
            <p className="text-sm text-zinc-600 mt-0.5">
              No se realizará ningún cobro. Tu acceso vuelve al plan Free.
            </p>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Plan actual</p>

        {loadingBilling ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando…</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", PLAN_INFO[plan].bg)}>
                  {PlanIcon
                    ? <PlanIcon className={cn("h-5 w-5", PLAN_INFO[plan].color)} />
                    : <span className="text-sm font-bold text-zinc-400">F</span>
                  }
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-lg">{PLAN_INFO[plan].label}</p>
                  <p className="text-xs text-zinc-500">{PLAN_INFO[plan].description}</p>
                </div>
              </div>

              {!isPaid && (
                <Link
                  href="/precios"
                  className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
                >
                  Mejorar plan <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Trial countdown */}
            {isPaid && enTrial && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {diasRestantes === 1
                      ? "Te queda 1 día de prueba gratuita"
                      : `Te quedan ${diasRestantes} días de prueba gratuita`}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    El primer cobro se realiza automáticamente al finalizar el período de prueba.
                  </p>
                </div>
              </div>
            )}

            {isPaid && !enTrial && billing?.trial_ends_at && (
              <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-700">Suscripción activa. Acceso completo habilitado.</p>
              </div>
            )}

            {/* Cancel section */}
            {isPaid && !cancelSuccess && (
              <div className="pt-2 border-t border-zinc-100">
                {!confirmCancel ? (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar suscripción
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">
                        {enTrial
                          ? "Si cancelás ahora, no se realizará ningún cobro y perderás el acceso al finalizar el período de prueba."
                          : "Si cancelás, tu suscripción se cancela inmediatamente y volvés al plan Free."
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelar}
                        disabled={loadingCancel}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
                        {loadingCancel
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Cancelando…</>
                          : "Sí, cancelar"
                        }
                      </button>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature comparison — for non-premium users */}
      {!loadingBilling && plan !== "premium" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Funciones por plan</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-zinc-500 font-medium w-1/2">Función</th>
                  <th className="pb-3 text-center text-zinc-500 font-medium">Free</th>
                  <th className="pb-3 text-center text-zinc-500 font-medium">Pro</th>
                  <th className="pb-3 text-center text-zinc-500 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { label: "Simulador básico",          free: true,  pro: true,  premium: true  },
                  { label: "Semáforo de facturación",   free: true,  pro: true,  premium: true  },
                  { label: "Dashboard 12 meses",        free: false, pro: true,  premium: true  },
                  { label: "Proyección a 6 meses",      free: false, pro: true,  premium: true  },
                  { label: "Monto seguro mensual",      free: false, pro: true,  premium: true  },
                  { label: "Alertas por email",         free: false, pro: true,  premium: true  },
                  { label: "Simulador grandes compras", free: false, pro: false, premium: true  },
                  { label: "Alertas por WhatsApp",      free: false, pro: false, premium: true  },
                  { label: "Soporte prioritario",       free: false, pro: false, premium: true  },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-2.5 text-zinc-700">{row.label}</td>
                    <td className="py-2.5 text-center text-zinc-400">{row.free  ? "✓" : "—"}</td>
                    <td className="py-2.5 text-center text-zinc-400">{row.pro   ? "✓" : "—"}</td>
                    <td className="py-2.5 text-center text-zinc-400">{row.premium ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 text-center">
            <Link
              href="/precios"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Ver planes y comenzar prueba <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto pt-10 text-sm text-zinc-400">Cargando...</div>}>
      <BillingContent />
    </Suspense>
  );
}
