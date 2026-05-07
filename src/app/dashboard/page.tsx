"use client";

import { useDashboard } from "@/lib/store";
import { SemaforoCard } from "@/components/dashboard/semaforo-card";
import { FacturacionCard, GastosIngresosCard } from "@/components/dashboard/cards-resumen";
import { GraficoMensual } from "@/components/dashboard/grafico-mensual";
import { Recomendaciones } from "@/components/dashboard/recomendaciones";
import { LockedFeature } from "@/components/locked-feature";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function DashboardPage() {
  const { resumen, datosMensuales, config, tieneDataReal } = useDashboard();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Dashboard</h2>
          <p className="text-zinc-500 mt-0.5 text-sm">
            Situación fiscal en tiempo real · Últimos 12 meses móviles
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!tieneDataReal && (
            <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-200">
              Datos de demostración
            </Badge>
          )}
          <Link
            href="/dashboard/cargar"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            {tieneDataReal ? "Actualizar datos" : "Cargar mis datos"}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SemaforoCard resumen={resumen} />
        <FacturacionCard resumen={resumen} config={config} />
        <LockedFeature requiredPlan="pro">
          <GastosIngresosCard resumen={resumen} />
        </LockedFeature>
      </div>

      <LockedFeature requiredPlan="pro">
        <Recomendaciones resumen={resumen} config={config} />
      </LockedFeature>

      <LockedFeature requiredPlan="pro">
        <GraficoMensual datos={datosMensuales} limiteAnual={resumen.limiteAnualActual} />
      </LockedFeature>
    </div>
  );
}
