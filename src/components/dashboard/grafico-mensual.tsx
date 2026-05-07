"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearPeso } from "@/lib/calculos";
import type { DatosMensual } from "@/lib/types";

interface Props {
  datos: DatosMensual[];
  limiteAnual: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm text-xs space-y-1">
      <p className="font-semibold text-zinc-700 mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-zinc-500">{entry.name === "ingresos" ? "Ingresos" : "Egresos"}:</span>
          <span className="font-medium text-zinc-800 tabular-nums">{formatearPeso(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function GraficoMensual({ datos, limiteAnual }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const limiteMensual = limiteAnual / 12;

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Evolución mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 animate-pulse rounded-lg bg-zinc-100" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Evolución mensual</CardTitle>
          <p className="text-xs text-zinc-400">
            Línea naranja = tope mensual prorrateado (límite anual ÷ 12)
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={datos}
            margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="mesLabel"
              tick={{ fontSize: 11, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => formatearPeso(v, true)}
              tick={{ fontSize: 11, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              formatter={(v) => (v === "ingresos" ? "Ingresos" : "Egresos")}
            />
            <ReferenceLine
              y={limiteMensual}
              stroke="#f97316"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: `${formatearPeso(limiteMensual, true)}/mes`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "#f97316",
              }}
            />
            <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="egresos"  fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
