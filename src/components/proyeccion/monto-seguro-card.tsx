"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearPeso } from "@/lib/calculos";
import type { MontoSeguroPorMes } from "@/lib/types";
import { ShieldCheck } from "lucide-react";

interface Props {
  montoSeguro: MontoSeguroPorMes;
}

interface Umbral {
  label: string;
  monto: number;
  color: string;
  bgColor: string;
  desc: string;
}

export function MontoSeguroCard({ montoSeguro }: Props) {
  const { mesLabel, ingresoQueDropea, montoParaQuedarVerde, montoParaQuedarAmarillo, montoMaximoSinExceder } = montoSeguro;

  const umbrales: Umbral[] = [
    {
      label: "Para quedar en zona verde",
      monto: montoParaQuedarVerde,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50 border-emerald-200",
      desc: "Facturá esto o menos y mantenerás el semáforo verde (< 80% del tope)",
    },
    {
      label: "Para quedar en zona amarilla",
      monto: montoParaQuedarAmarillo,
      color: "text-amber-700",
      bgColor: "bg-amber-50 border-amber-200",
      desc: "Máximo para no entrar en zona roja (< 95% del tope)",
    },
    {
      label: "Máximo sin exceder el límite",
      monto: montoMaximoSinExceder,
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
      desc: "Si superás este monto entrarás en la categoría siguiente",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-zinc-400" />
          <CardTitle className="text-base font-semibold">
            ¿Cuánto podés facturar en {mesLabel}?
          </CardTitle>
        </div>
        {ingresoQueDropea > 0 && (
          <p className="text-xs text-zinc-400 mt-1">
            Este mes sale de la ventana: <strong>{formatearPeso(ingresoQueDropea, true)}</strong> (mismo mes del año pasado)
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {umbrales.map((u) => (
          <div key={u.label} className={`rounded-lg border px-4 py-3 ${u.bgColor}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">{u.label}</p>
              <p className={`text-lg font-bold tabular-nums ${u.color}`}>
                {formatearPeso(u.monto, true)}
              </p>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{u.desc}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
