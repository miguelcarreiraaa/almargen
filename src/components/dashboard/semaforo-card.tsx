"use client";

import { Card, CardContent } from "@/components/ui/card";
import { COLORES_SEMAFORO } from "@/lib/monotributo-config";
import { formatearPeso } from "@/lib/calculos";
import type { ResumenDashboard } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONO_SEMAFORO = {
  verde:    "🟢",
  amarillo: "🟡",
  rojo:     "🔴",
  excedido: "🚨",
};

interface Props {
  resumen: ResumenDashboard;
}

export function SemaforoCard({ resumen }: Props) {
  const { estadoSemaforo, porcentajeTope, categoriaActualId, montoRestante } = resumen;
  const colores = COLORES_SEMAFORO[estadoSemaforo];
  const pct = Math.min(porcentajeTope * 100, 100);

  return (
    <Card className={cn("border-2 h-full", colores.border)}>
      <CardContent className="pt-6 flex flex-col gap-4 h-full">

        {/* Estado */}
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{ICONO_SEMAFORO[estadoSemaforo]}</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Estado</p>
            <p className={cn("text-base font-bold leading-tight", colores.text)}>
              {colores.label}
            </p>
          </div>
        </div>

        {/* Porcentaje grande */}
        <div>
          <p className={cn("text-5xl font-extrabold tabular-nums", colores.text)}>
            {pct.toFixed(1)}%
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">del tope · Categoría {categoriaActualId}</p>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-1">
          <div className="h-3 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", {
                "bg-emerald-500": estadoSemaforo === "verde",
                "bg-amber-500":   estadoSemaforo === "amarillo",
                "bg-red-500":     estadoSemaforo === "rojo",
                "bg-red-700":     estadoSemaforo === "excedido",
              })}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            {montoRestante > 0
              ? `Quedan ${formatearPeso(montoRestante, true)} para el tope`
              : "Tope superado — recategorizate"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
