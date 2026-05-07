"use client";

import { useDashboard } from "@/lib/store";
import { calcularProyeccionMensual, calcularMontoSeguroMes } from "@/lib/calculos";
import { TablaProyeccion } from "@/components/proyeccion/tabla-proyeccion";
import { MontoSeguroCard } from "@/components/proyeccion/monto-seguro-card";
import { CruceDatosCard } from "@/components/proyeccion/cruce-datos-card";
import { LockedFeature } from "@/components/locked-feature";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

const HOY_DEMO = new Date(2026, 4, 3);

export default function ProyeccionPage() {
  const { transacciones, config, resumen, datosMensuales, tieneDataReal } = useDashboard();

  const today = tieneDataReal ? new Date() : HOY_DEMO;

  const proyeccion = useMemo(
    () => calcularProyeccionMensual(transacciones, config, 6, today),
    [transacciones, config, today]
  );

  const montoSeguro = useMemo(
    () => calcularMontoSeguroMes(resumen.facturacion12m, transacciones, resumen.limiteAnualActual, today),
    [resumen.facturacion12m, transacciones, resumen.limiteAnualActual, today]
  );

  const mesesCriticos = proyeccion.filter((m) => m.estado === "rojo" || m.estado === "excedido");
  const primerMesCritico = mesesCriticos[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Proyección</h2>
          <p className="text-zinc-500 mt-0.5 text-sm">
            Evolución estimada de tu facturación para los próximos 6 meses
          </p>
        </div>
        {!tieneDataReal && (
          <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-200">
            Datos de demostración
          </Badge>
        )}
      </div>

      <LockedFeature requiredPlan="pro" className="space-y-8">
        <div className="space-y-8">
          {primerMesCritico && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
              <span className="text-xl leading-none shrink-0">🚨</span>
              <p className="text-red-800">
                <strong>Alerta de proyección:</strong> A este ritmo, en{" "}
                <strong>{primerMesCritico.mesLabel}</strong> el total acumulado de los últimos 12 meses
                llegaría al{" "}
                {primerMesCritico.estado === "excedido" ? "límite" : "95%"} de la Categoría{" "}
                {config.categoriaActualId}. Considerá reducir la facturación o iniciar el trámite de recategorización.
              </p>
            </div>
          )}

          {!primerMesCritico && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <span className="text-xl leading-none shrink-0">✅</span>
              <p className="text-emerald-800">
                <strong>Proyección favorable:</strong> Al ritmo actual, los próximos 6 meses no superarías
                la zona roja. Igual revisá el monto seguro para el próximo mes.
              </p>
            </div>
          )}

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-zinc-800">
              Evolución proyectada — próximos 6 meses
            </h3>
            <p className="text-xs text-zinc-400">
              Metodología: ventana rodante de 12 meses. Cada mes suma el ingreso estimado
              y descuenta el ingreso del mismo mes del año anterior.
            </p>
            <TablaProyeccion proyeccion={proyeccion} limiteAnual={resumen.limiteAnualActual} />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MontoSeguroCard montoSeguro={montoSeguro} />
            <CruceDatosCard resumen={resumen} datosMensuales={datosMensuales} />
          </div>
        </div>
      </LockedFeature>
    </div>
  );
}
