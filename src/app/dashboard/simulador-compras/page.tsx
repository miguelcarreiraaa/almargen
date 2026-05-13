"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/store";
import { formatearPeso } from "@/lib/calculos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LockedFeature } from "@/components/locked-feature";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

function parseMonto(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("es-AR");
}

export default function SimuladorComprasPage() {
  const { resumen, config } = useDashboard();
  const [rawInput, setRawInput] = useState("");

  const monto = parseMonto(rawInput);

  const facturacion12m = resumen.facturacion12m;
  const limiteAnual = resumen.limiteAnualActual;
  const proyectado = facturacion12m + monto;
  const porcentaje = limiteAnual > 0 ? proyectado / limiteAnual : 0;

  const zona =
    porcentaje >= 0.95 ? "critico" :
    porcentaje >= 0.75 ? "riesgoso" :
    "seguro";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Simulador de grandes compras</h2>
        <p className="text-zinc-500 mt-0.5 text-sm">
          Simulá el impacto de una operación o venta grande en tu categoría de monotributo
        </p>
      </div>

      <LockedFeature requiredPlan="pro">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-700">
                Monto de la operación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Ingresá el monto (ARS)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rawInput}
                    onChange={(e) => setRawInput(formatInput(e.target.value))}
                    placeholder="0"
                    className="w-full rounded-lg border border-zinc-200 bg-white pl-7 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
              </div>

              {monto > 0 && (
                <div
                  className={`rounded-xl border p-4 flex items-start gap-3 ${
                    zona === "seguro"
                      ? "border-emerald-200 bg-emerald-50"
                      : zona === "riesgoso"
                        ? "border-amber-200 bg-amber-50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  {zona === "seguro" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : zona === "riesgoso" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        zona === "seguro"
                          ? "text-emerald-800"
                          : zona === "riesgoso"
                            ? "text-amber-800"
                            : "text-red-800"
                      }`}
                    >
                      {zona === "seguro"
                        ? "Operación segura"
                        : zona === "riesgoso"
                          ? "Zona de precaución"
                          : "Riesgo de recategorización"}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        zona === "seguro"
                          ? "text-emerald-700"
                          : zona === "riesgoso"
                            ? "text-amber-700"
                            : "text-red-700"
                      }`}
                    >
                      Con esta operación tu facturación acumulada de 12 meses llegaría al{" "}
                      <strong>{(porcentaje * 100).toFixed(1)}%</strong> del límite de la Categoría{" "}
                      {config.categoriaActualId}.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {monto > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-700">Resumen del impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Facturación 12m actual</p>
                    <p className="font-semibold text-zinc-800 tabular-nums">
                      {formatearPeso(facturacion12m)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">+ esta operación</p>
                    <p className="font-semibold text-zinc-800 tabular-nums">
                      + {formatearPeso(monto)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Total proyectado</p>
                    <p className="font-bold text-zinc-900 tabular-nums">
                      {formatearPeso(proyectado)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">
                      Límite Categoría {config.categoriaActualId}
                    </p>
                    <p className="font-semibold text-zinc-800 tabular-nums">
                      {formatearPeso(limiteAnual)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Uso del límite</span>
                    <span>{(porcentaje * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        zona === "seguro"
                          ? "bg-emerald-500"
                          : zona === "riesgoso"
                            ? "bg-amber-400"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(porcentaje * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </LockedFeature>
    </div>
  );
}
