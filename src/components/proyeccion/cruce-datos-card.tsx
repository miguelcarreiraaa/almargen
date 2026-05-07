"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearPeso } from "@/lib/calculos";
import { PARAMETROS_GENERALES } from "@/lib/monotributo-config";
import type { DatosMensual, ResumenDashboard } from "@/lib/types";
import { AlertCircle, CheckCircle2, XCircle, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  resumen: ResumenDashboard;
  datosMensuales: DatosMensual[];
}

export function CruceDatosCard({ resumen, datosMensuales }: Props) {
  const { facturacion12m, gastos12m, ratioGastosIngresos } = resumen;
  const FACTOR = PARAMETROS_GENERALES.factorGastosPersonales;
  const limiteARCA = facturacion12m * FACTOR;
  const pctUsado = Math.min(ratioGastosIngresos / FACTOR, 1);

  const estado =
    ratioGastosIngresos > FACTOR      ? "peligro"   :
    ratioGastosIngresos > FACTOR * 0.8 ? "alerta"    :
                                          "seguro";

  const estadoUI = {
    seguro:  { icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />, bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", label: "Sin riesgo" },
    alerta:  { icon: <AlertCircle  className="h-5 w-5 text-amber-600   shrink-0" />, bg: "bg-amber-50   border-amber-200",   text: "text-amber-800",   label: "Atención"   },
    peligro: { icon: <XCircle      className="h-5 w-5 text-red-600     shrink-0" />, bg: "bg-red-50     border-red-200",     text: "text-red-800",     label: "Riesgo ARCA" },
  }[estado];

  // Los 3 meses con mayor ratio gastos/ingresos
  const mesesConRatio = datosMensuales
    .filter((m) => m.ingresos > 0)
    .map((m) => ({ ...m, ratio: m.egresos / m.ingresos }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-zinc-400" />
          <CardTitle className="text-base font-semibold">
            Cruce de datos ARCA
          </CardTitle>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Si tus gastos personales superan {FACTOR}× tus ingresos declarados, ARCA puede investigarte por subdeclaración.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Estado general */}
        <div className={cn("flex items-start gap-3 rounded-xl border p-4", estadoUI.bg)}>
          {estadoUI.icon}
          <div>
            <p className={cn("font-semibold text-sm", estadoUI.text)}>{estadoUI.label}</p>
            <p className={cn("text-xs mt-0.5", estadoUI.text)}>
              Tus gastos representan el{" "}
              <strong>{(ratioGastosIngresos * 100).toFixed(1)}%</strong> de tus ingresos declarados.
              {estado === "seguro" && " Estás dentro del margen aceptable."}
              {estado === "alerta" && " Estás acercándote al límite de ARCA."}
              {estado === "peligro" && ` Superás el límite de ${FACTOR}× que utiliza ARCA como señal de alerta.`}
            </p>
          </div>
        </div>

        {/* Barra comparativa */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Gastos vs límite ARCA</span>
            <span>{(ratioGastosIngresos * 100).toFixed(1)}% / {FACTOR * 100}%</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-100 overflow-hidden relative">
            <div
              className={cn("h-full rounded-full transition-all", {
                "bg-emerald-500": estado === "seguro",
                "bg-amber-500":   estado === "alerta",
                "bg-red-500":     estado === "peligro",
              })}
              style={{ width: `${pctUsado * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs tabular-nums">
            <span className="text-zinc-500">Gastos: {formatearPeso(gastos12m, true)}</span>
            <span className="text-zinc-400">Límite ARCA: {formatearPeso(limiteARCA, true)}</span>
          </div>
        </div>

        {/* Meses con ratio más alto */}
        {mesesConRatio.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">Meses con mayor ratio gastos/ingresos</p>
            <div className="space-y-1.5">
              {mesesConRatio.map((m) => (
                <div key={m.mesKey} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-16 shrink-0">{m.mesLabel}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", m.ratio > FACTOR ? "bg-red-400" : m.ratio > 0.8 ? "bg-amber-400" : "bg-zinc-300")}
                      style={{ width: `${Math.min(m.ratio / FACTOR, 1) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-zinc-400 w-12 text-right">
                    {(m.ratio * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
