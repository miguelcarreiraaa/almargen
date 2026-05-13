"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Check, Clock, ArrowRight, Gift, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadModal } from "@/components/lead-modal";

type CtaAction = "signup" | "checkout" | "lead";

interface Feature {
  text: string;
  soon?: true;
}

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  destacado: boolean;
  badge: string | null;
  microcopy: string | null;
  cta: { label: string; action: CtaAction };
  features: Feature[];
}

const PLANES: Plan[] = [
  {
    id: "free",
    nombre: "Free",
    descripcion: "Para conocer tu situación sin comprometerte",
    precioMensual: 0,
    precioAnual: 0,
    destacado: false,
    badge: null,
    microcopy: null,
    cta: { label: "Empezar gratis", action: "signup" },
    features: [
      { text: "Semáforo básico (verde/amarillo/rojo)" },
      { text: "1 carga de CSV por mes" },
      { text: "Valores ARCA 2026 actualizados" },
      { text: "Cálculo manual de categoría" },
    ],
  },
  {
    id: "pro",
    nombre: "Pro",
    descripcion: "Control total de tu monotributo",
    precioMensual: 7900,
    precioAnual: 79000,
    destacado: true,
    badge: "Más popular",
    microcopy: null,
    cta: { label: "Empezar prueba gratuita", action: "checkout" },
    features: [
      { text: "Todo lo del Free" },
      { text: "Dashboard completo 12 meses" },
      { text: "Proyección 6 meses · Metodología ARCA 12m" },
      { text: "Monto seguro mensual" },
      { text: "Cruce ARCA 1.5× (gastos vs ingresos)" },
      { text: "Simulador de grandes compras" },
      { text: "Validador ¿esta compra me expulsa del régimen?" },
      { text: "Alertas por email pre-recategorización" },
      { text: "Cargas ilimitadas de CSV" },
      { text: "Soporte por email" },
    ],
  },
  {
    id: "estudio",
    nombre: "Estudio",
    descripcion: "Para contadores y estudios contables",
    precioMensual: 34900,
    precioAnual: 349000,
    destacado: false,
    badge: null,
    microcopy: "$1.745 por cliente gestionado · Hasta 20 monotributistas en cartera",
    cta: { label: "Hablar con nosotros", action: "lead" },
    features: [
      { text: "Todo lo del Pro" },
      { text: "Dashboard multi-cliente (hasta 20 monotributistas)", soon: true },
      { text: "Vista consolidada de semáforos de todos los clientes", soon: true },
      { text: "Alertas por WhatsApp cuando un cliente entra en amarillo/rojo", soon: true },
      { text: "Reportes exportables PDF para clientes", soon: true },
      { text: "Soporte directo por WhatsApp", soon: true },
    ],
  },
];

const CARD_ORDER: Record<string, string> = {
  free:    "order-2 md:order-1",
  pro:     "order-1 md:order-2",
  estudio: "order-3 md:order-3",
};

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
  const [showLeadModal, setShowLeadModal] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();

  async function handleCta(plan: Plan) {
    if (plan.cta.action === "signup") {
      router.push(isSignedIn ? "/dashboard" : "/sign-up");
      return;
    }
    if (plan.cta.action === "lead") {
      setShowLeadModal(true);
      return;
    }
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }
    const priceKey = `${plan.id}_${ciclo}`;
    setLoading(plan.id);
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
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-5">
          <Gift className="h-3.5 w-3.5" />
          7 días de prueba gratuita en el plan Pro
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
              2 meses gratis
            </span>
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANES.map((plan) => {
            const isLoading = loading === plan.id;
            const showAnual = ciclo === "anual" && plan.precioAnual > 0;
            const availableFeatures = plan.features.filter((f) => !f.soon);
            const soonFeatures = plan.features.filter((f) => f.soon);

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl border p-6 flex flex-col",
                  CARD_ORDER[plan.id],
                  plan.destacado
                    ? "border-[#1a1f1c] bg-[#1a1f1c] text-white shadow-2xl"
                    : "border-zinc-200 bg-white"
                )}
              >
                {/* Badge — ribbon verde al tope del card */}
                {plan.badge && (
                  <div className="-mx-6 -mt-6 mb-5 bg-[#1fa36b] rounded-t-2xl py-2.5 text-center">
                    <span className="text-xs font-bold text-white tracking-wide">{plan.badge}</span>
                  </div>
                )}

                {/* Plan name + description */}
                <div className="mb-4">
                  <p className={cn("text-xl font-bold tracking-tight", plan.destacado ? "text-white" : "text-zinc-900")}>
                    {plan.nombre}
                  </p>
                  <p className={cn("text-xs mt-1 leading-relaxed", plan.destacado ? "text-zinc-400" : "text-zinc-500")}>
                    {plan.descripcion}
                  </p>
                </div>

                {/* Precio */}
                <div className="mb-1">
                  {plan.precioMensual === 0 ? (
                    <>
                      <p className="text-4xl font-bold text-zinc-900">
                        $0<span className="text-sm font-normal text-zinc-400">/mes</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">Siempre gratis · Sin tarjeta</p>
                    </>
                  ) : showAnual ? (
                    <>
                      <p className={cn("text-4xl font-bold tabular-nums", plan.destacado ? "text-white" : "text-zinc-900")}>
                        {formatearPrecio(plan.precioAnual)}
                        <span className={cn("text-sm font-normal", plan.destacado ? "text-zinc-400" : "text-zinc-400")}>/año</span>
                      </p>
                      <p className={cn("text-xs mt-1", plan.destacado ? "text-emerald-400" : "text-emerald-600")}>
                        Equivale a {formatearPrecio(Math.round(plan.precioAnual / 12))}/mes · 2 meses gratis
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={cn("text-4xl font-bold tabular-nums", plan.destacado ? "text-white" : "text-zinc-900")}>
                        {formatearPrecio(plan.precioMensual)}
                        <span className={cn("text-sm font-normal", plan.destacado ? "text-zinc-400" : "text-zinc-400")}>/mes</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Microcopy (Estudio) */}
                {plan.microcopy && (
                  <p className="text-xs text-zinc-400 mb-4 mt-1">{plan.microcopy}</p>
                )}

                {/* Trial badge (Pro only) */}
                {plan.cta.action === "checkout" && (
                  <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium mt-3 mb-4 bg-emerald-500/20 text-emerald-300">
                    <Gift className="h-3.5 w-3.5 shrink-0" />
                    7 días de prueba gratis · primer cobro al 8° día
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleCta(plan)}
                  disabled={isLoading}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors mt-4 mb-6 disabled:opacity-70",
                    plan.cta.action === "checkout"
                      ? "bg-[#1fa36b] text-[#1a1f1c] hover:bg-[#1a8f5d]"
                      : plan.cta.action === "lead"
                        ? "border border-[#1fa36b] text-[#1fa36b] bg-transparent hover:bg-emerald-50"
                        : "border border-zinc-200 text-zinc-800 bg-white hover:bg-zinc-50"
                  )}
                >
                  {isLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirigiendo…</>
                    : <>{plan.cta.label} <ArrowRight className="h-4 w-4" /></>
                  }
                </button>

                {/* Features disponibles */}
                <ul className="space-y-2.5 flex-1">
                  {availableFeatures.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 mt-0.5 text-[#1fa36b]" />
                      <span className={plan.destacado ? "text-zinc-300" : "text-zinc-600"}>{f.text}</span>
                    </li>
                  ))}

                  {/* Sección "En desarrollo" */}
                  {soonFeatures.length > 0 && (
                    <>
                      <li className="pt-3 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <Lock className="h-3 w-3" />
                          En desarrollo
                        </span>
                      </li>
                      {soonFeatures.map((f) => (
                        <li key={f.text} className="flex items-start gap-2 text-sm">
                          <Clock className="h-4 w-4 shrink-0 mt-0.5 text-zinc-300" />
                          <span className="text-zinc-400 leading-relaxed">
                            {f.text}
                            <span className="ml-1.5 inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                              Próximamente
                            </span>
                          </span>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer notes */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-xs text-zinc-400">
            ¿Solo querés probar? El simulador básico es gratis y no requiere registro.{" "}
            <Link href="/" className="underline hover:text-zinc-600 transition-colors">
              Ir al simulador
            </Link>
          </p>
          <p className="text-xs text-zinc-400">
            Precios en pesos argentinos · Sin permanencia mínima · Cancelás cuando querés
          </p>
        </div>
      </section>

      <LeadModal open={showLeadModal} onClose={() => setShowLeadModal(false)} />

    </div>
  );
}
