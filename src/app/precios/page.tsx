"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Check, ArrowRight, Shield, Star, Loader2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANES = [
  {
    id: "pro",
    nombre: "Pro",
    descripcion: "Para monotributistas que quieren control total",
    icon: Shield,
    precioMensual: 15000,
    precioAnual: 144000,
    descuentoAnual: 20,
    ahorroAnual: 36000,
    destacado: false,
    features: [
      "Dashboard completo 12 meses",
      "Proyección a 6 meses",
      "Monto seguro mensual",
      "Cruce ARCA (gastos/ingresos)",
      "Alertas por email",
      "Configuración de categoría y actividad",
    ],
  },
  {
    id: "premium",
    nombre: "Premium",
    descripcion: "Modo Blindaje — el máximo nivel de protección",
    icon: Star,
    precioMensual: 25000,
    precioAnual: 225000,
    descuentoAnual: 25,
    ahorroAnual: 75000,
    destacado: true,
    features: [
      "Todo lo de Pro",
      "Simulador de grandes compras",
      "¿Esta compra me expulsa del régimen?",
      "Alertas por WhatsApp",
      "Soporte prioritario",
    ],
  },
];

function formatearPrecio(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PreciosPage() {
  const [ciclo, setCiclo] = useState<"mensual" | "anual">("mensual");
  const [loading, setLoading] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const router = useRouter();

  async function handleEmpezar(planId: string) {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    const priceKey = `${planId}_${ciclo}`;
    setLoading(planId);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Error al iniciar la suscripción");
        setLoading(null);
      }
    } catch {
      alert("Error de conexión. Intentá de nuevo.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <header className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
            Al<span className="text-emerald-500">Margen</span>
          </Link>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                Mi dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                  Ingresar
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
                >
                  Empezar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-6">
          <Gift className="h-3.5 w-3.5" />
          7 días de prueba gratuita en todos los planes
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Planes y precios</h1>
        <p className="mt-3 text-zinc-500 text-base max-w-md mx-auto">
          Probá 7 días sin cargo. Sin permanencia. Cancelás cuando querés.
        </p>

        {/* Toggle mensual / anual */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
          <button
            onClick={() => setCiclo("mensual")}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
              ciclo === "mensual" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Mensual
          </button>
          <button
            onClick={() => setCiclo("anual")}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2",
              ciclo === "anual" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Anual
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              ciclo === "anual" ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
            )}>
              hasta −25%
            </span>
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-2xl mx-auto">
          {PLANES.map((plan) => {
            const PlanIcon = plan.icon;
            const isLoading = loading === plan.id;
            const precioBase = ciclo === "anual"
              ? Math.round(plan.precioAnual / 12)
              : plan.precioMensual;

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl border p-6 flex flex-col",
                  plan.destacado
                    ? "border-zinc-900 shadow-xl bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white"
                )}
              >
                {plan.destacado && (
                  <div className="mb-4">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      Más popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    plan.destacado ? "bg-zinc-700" : "bg-zinc-100"
                  )}>
                    <PlanIcon className={cn("h-4 w-4", plan.destacado ? "text-white" : "text-zinc-700")} />
                  </div>
                  <span className={cn("font-bold text-lg", plan.destacado ? "text-white" : "text-zinc-900")}>
                    {plan.nombre}
                  </span>
                </div>

                <p className={cn("text-xs mb-5 leading-relaxed", plan.destacado ? "text-zinc-400" : "text-zinc-500")}>
                  {plan.descripcion}
                </p>

                {/* Precio */}
                <div className="mb-2">
                  <p className={cn("text-4xl font-bold tabular-nums", plan.destacado ? "text-white" : "text-zinc-900")}>
                    {formatearPrecio(precioBase)}
                    <span className="text-sm font-normal text-zinc-400">/mes</span>
                  </p>
                  {ciclo === "anual" && (
                    <p className={cn("text-xs mt-1", plan.destacado ? "text-emerald-400" : "text-emerald-600")}>
                      {formatearPrecio(plan.precioAnual)} /año · ahorrás {formatearPrecio(plan.ahorroAnual)} ({plan.descuentoAnual}% off)
                    </p>
                  )}
                </div>

                {/* Trial badge */}
                <div className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium mb-5",
                  plan.destacado ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                )}>
                  <Gift className="h-3.5 w-3.5 shrink-0" />
                  7 días de prueba gratis · primer cobro al 8° día
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleEmpezar(plan.id)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors mb-6 disabled:opacity-70",
                    plan.destacado
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "bg-zinc-900 text-white hover:bg-zinc-700"
                  )}
                >
                  {isLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirigiendo...</>
                    : <>Empezar prueba gratuita <ArrowRight className="h-4 w-4" /></>
                  }
                </button>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={cn("h-4 w-4 shrink-0 mt-0.5", plan.destacado ? "text-emerald-400" : "text-emerald-500")} />
                      <span className={plan.destacado ? "text-zinc-300" : "text-zinc-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Free note */}
        <p className="text-center text-xs text-zinc-400 mt-10">
          ¿Solo querés probar? El simulador básico es gratis y no requiere registro.{" "}
          <Link href="/" className="underline hover:text-zinc-600 transition-colors">
            Ir al simulador
          </Link>
        </p>
        <p className="text-center text-xs text-zinc-400 mt-2">
          Precios en pesos argentinos. Sin permanencia mínima. Cancelás cuando querés.
        </p>
      </section>

    </div>
  );
}
