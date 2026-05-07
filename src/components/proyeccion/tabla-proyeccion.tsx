"use client";

import { COLORES_SEMAFORO } from "@/lib/monotributo-config";
import { formatearPeso } from "@/lib/calculos";
import type { ProyeccionMes } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  proyeccion: ProyeccionMes[];
  limiteAnual: number;
}

const ICONO = { verde: "🟢", amarillo: "🟡", rojo: "🔴", excedido: "🚨" };

export function TablaProyeccion({ proyeccion, limiteAnual }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Mes</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Ingreso est.</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Sale de ventana</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Cambio neto</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Total 12m</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">% tope</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500">Estado</th>
          </tr>
        </thead>
        <tbody>
          {proyeccion.map((mes) => {
            const colores = COLORES_SEMAFORO[mes.estado];
            const pct = (mes.porcentajeTope * 100).toFixed(1);
            return (
              <tr key={mes.mesKey} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-800">{mes.mesLabel}</td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                  {formatearPeso(mes.ingresoEstimado, true)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                  {mes.ingresoQueDropea > 0
                    ? `−${formatearPeso(mes.ingresoQueDropea, true)}`
                    : "—"}
                </td>
                <td className={cn(
                  "px-4 py-3 text-right tabular-nums font-medium",
                  mes.netChange >= 0 ? "text-emerald-600" : "text-amber-600"
                )}>
                  {mes.netChange >= 0 ? "+" : ""}
                  {formatearPeso(mes.netChange, true)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-zinc-800">
                  {formatearPeso(mes.total12m, true)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", {
                          "bg-emerald-500": mes.estado === "verde",
                          "bg-amber-500":   mes.estado === "amarillo",
                          "bg-red-500":     mes.estado === "rojo",
                          "bg-red-700":     mes.estado === "excedido",
                        })}
                        style={{ width: `${Math.min(mes.porcentajeTope * 100, 100)}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-xs text-zinc-500 w-12 text-right">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                    colores.bg, colores.text, colores.border
                  )}>
                    {ICONO[mes.estado]} {colores.label.split(" ")[0]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-400">
        Ingreso estimado = promedio de los últimos 3 meses · Límite anual: {formatearPeso(limiteAnual)}
      </div>
    </div>
  );
}
