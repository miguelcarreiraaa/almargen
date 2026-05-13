import Link from "next/link";
import { ArrowRight, BarChart2, ShieldCheck, Zap, Lock } from "lucide-react";
import { SimuladorGratuito } from "@/components/landing/simulador-gratuito";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
            Al<span className="text-emerald-500">Margen</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/precios" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Precios
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-medium text-emerald-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Actualizado con valores 2026
        </div>
        <h1 className="text-5xl font-bold text-zinc-900 leading-tight tracking-tight max-w-3xl mx-auto">
          Tu monotributo bajo control,<br />
          <span className="text-emerald-500">mes a mes</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Semáforo fiscal en tiempo real, proyección 6 meses · Metodología ARCA 12m, y alertas predictivas para
          que nunca más te sorprenda la recategorización.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors shadow-sm"
          >
            Crear cuenta gratuita
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
        <p className="mt-4 text-xs text-zinc-400">Sin tarjeta. Simulador gratis para siempre.</p>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-100 bg-zinc-50/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
                <BarChart2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-zinc-900">Semáforo en tiempo real</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Ventana rodante de 12 meses. Verde, amarillo o rojo según tu nivel de riesgo de recategorización.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-zinc-900">Proyección 6 meses · Metodología ARCA 12m</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Sabé cuánto podés facturar cada mes para mantenerte en tu categoría. Con la metodología exacta del ARCA.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-zinc-900">Alerta de cruce ARCA</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Detectá si tus gastos personales superan el 1.5× de tus ingresos declarados y evitá la fiscalización.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Simulador gratuito ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 mb-4">
            Gratis · Sin registro
          </span>
          <h2 className="text-3xl font-bold text-zinc-900">Probalo ahora</h2>
          <p className="mt-2 text-zinc-500 text-sm">
            Subí tu CSV y ves el semáforo al instante. El análisis de gastos y proyección están disponibles en los planes pagos.
          </p>
        </div>
        <SimuladorGratuito />
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <section className="bg-zinc-900 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            ¿Querés el análisis completo?
          </h2>
          <p className="mt-4 text-zinc-400 text-sm">
            Desbloqueá proyección 6 meses · Metodología ARCA 12m, cruce ARCA, monto seguro mensual y alertas por email.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/precios"
              className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            >
              Ver planes Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <span>
            Al<span className="text-emerald-500">Margen</span> · Semáforo de Monotributo · Argentina 2026
          </span>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Los valores son estimados. Verificá siempre en</span>
            <a href="https://www.argentina.gob.ar/monotributo" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600">
              argentina.gob.ar/monotributo
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
