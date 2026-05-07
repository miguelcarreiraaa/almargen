"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatearPeso } from "@/lib/calculos";
import { CATEGORIAS_SERVICIOS, CATEGORIAS_BIENES } from "@/lib/monotributo-config";
import type { ConfigUsuario, ResumenDashboard } from "@/lib/types";
import { TrendingUp, Wallet } from "lucide-react";

interface Props {
  resumen: ResumenDashboard;
  config: ConfigUsuario;
}

// ─── Tarjeta: Facturación últimos 12 meses ───────────────────────────────────

export function FacturacionCard({ resumen, config }: Props) {
  const { facturacion12m, limiteAnualActual, porcentajeTope, promedioMensualReciente } = resumen;
  const pct = Math.min(porcentajeTope * 100, 100);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-zinc-400" />
          <CardTitle className="text-sm font-medium text-zinc-500">
            Facturación últimos 12 meses
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Monto principal */}
        <div>
          <p className="text-3xl font-bold text-zinc-900 tabular-nums">
            {formatearPeso(facturacion12m, true)}
          </p>
          <p className="text-sm text-zinc-400 mt-0.5">
            de {formatearPeso(limiteAnualActual, true)} · Categoría {resumen.categoriaActualId}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{pct.toFixed(1)}% utilizado</span>
            <span>{(100 - pct).toFixed(1)}% libre</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Promedio mensual */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
          <span className="text-xs text-zinc-500">Promedio mensual (últ. 3 meses)</span>
          <span className="text-sm font-semibold text-zinc-800 tabular-nums">
            {formatearPeso(promedioMensualReciente, true)}
          </span>
        </div>

        <Badge variant="outline" className="text-xs">
          Actividad: {config.actividad}
        </Badge>
      </CardContent>
    </Card>
  );
}

// ─── Tarjeta: Gastos vs Ingresos ─────────────────────────────────────────────

export function GastosIngresosCard({ resumen }: Pick<Props, "resumen">) {
  const { facturacion12m, gastos12m, ratioGastosIngresos } = resumen;

  const ratioLabel =
    ratioGastosIngresos < 0.8  ? { text: "Normal",        cls: "text-emerald-600 bg-emerald-50 border-emerald-200" } :
    ratioGastosIngresos < 1.5  ? { text: "Elevado",        cls: "text-amber-600   bg-amber-50   border-amber-200"   } :
                                  { text: "Riesgo cruce",   cls: "text-red-600     bg-red-50     border-red-200"     };

  const LIMITE_ARCA = facturacion12m * 1.5;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-zinc-400" />
          <CardTitle className="text-sm font-medium text-zinc-500">
            Gastos vs Ingresos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Estado del ratio */}
        <div className={`rounded-lg border px-3 py-2 ${ratioLabel.cls}`}>
          <p className="text-xs font-medium">Relación gastos/ingresos</p>
          <p className="text-lg font-bold tabular-nums">
            {(ratioGastosIngresos * 100).toFixed(1)}%
            <span className="text-xs font-normal ml-2">{ratioLabel.text}</span>
          </p>
        </div>

        {/* Desglose */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">Ingresos declarados</span>
            </div>
            <span className="text-sm font-semibold tabular-nums">{formatearPeso(facturacion12m, true)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs text-zinc-500">Gastos registrados</span>
            </div>
            <span className="text-sm font-semibold tabular-nums">{formatearPeso(gastos12m, true)}</span>
          </div>
          <div className="border-t border-dashed pt-2 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Límite ARCA (1.5×)</span>
            <span className="text-xs text-zinc-400 tabular-nums">{formatearPeso(LIMITE_ARCA, true)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
