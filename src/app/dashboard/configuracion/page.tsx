"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/store";
import { CATEGORIAS_BIENES, CATEGORIAS_SERVICIOS } from "@/lib/monotributo-config";
import { formatearPeso } from "@/lib/calculos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Settings } from "lucide-react";

export default function ConfiguracionPage() {
  const { config, actualizarConfig } = useDashboard();

  const [actividad, setActividad] = useState<"servicios" | "bienes">(config.actividad);
  const [categoriaId, setCategoriaId] = useState(config.categoriaActualId);
  const [guardado, setGuardado] = useState(false);

  const tabla = actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
  const categoriaSeleccionada = tabla.find((c) => c.id === categoriaId) ?? tabla[0];

  function handleActividad(v: "servicios" | "bienes") {
    setActividad(v);
    const nuevaTabla = v === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
    const existe = nuevaTabla.find((c) => c.id === categoriaId);
    if (!existe) setCategoriaId(nuevaTabla[0].id);
  }

  function handleGuardar() {
    actualizarConfig({ actividad, categoriaActualId: categoriaId });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  const cambiosPendientes = actividad !== config.actividad || categoriaId !== config.categoriaActualId;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Configuración</h2>
        <p className="text-zinc-500 mt-0.5 text-sm">
          Ajustá tu categoría de monotributo y tipo de actividad
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-zinc-400" />
            <CardTitle className="text-sm font-medium text-zinc-700">Perfil fiscal</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Tipo de actividad</label>
            <div className="grid grid-cols-2 gap-2">
              {(["servicios", "bienes"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => handleActividad(v)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left ${
                    actividad === v
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {v === "servicios" ? "🛠 Servicios" : "📦 Venta de bienes"}
                  <p className={`text-xs mt-0.5 font-normal ${actividad === v ? "text-zinc-300" : "text-zinc-400"}`}>
                    {v === "servicios" ? "Categorías A–K" : "Categorías A–G"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Categoría actual</label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {tabla.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaId(cat.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
                    categoriaId === cat.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {cat.id}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Categoría {categoriaSeleccionada.id} — {actividad}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-zinc-400">Tope anual</p>
                <p className="font-semibold text-zinc-800 tabular-nums">
                  {formatearPeso(categoriaSeleccionada.limiteAnual)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Tope mensual (÷12)</p>
                <p className="font-semibold text-zinc-800 tabular-nums">
                  {formatearPeso(Math.round(categoriaSeleccionada.limiteAnual / 12))}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Cuota mensual estimada</p>
                <p className="font-semibold text-zinc-800 tabular-nums">
                  {formatearPeso(categoriaSeleccionada.cuotaMensual)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Alerta al 80% del tope</p>
                <p className="font-semibold text-amber-600 tabular-nums">
                  {formatearPeso(Math.round(categoriaSeleccionada.limiteAnual * 0.8))}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleGuardar}
              disabled={!cambiosPendientes && !guardado}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                guardado
                  ? "bg-emerald-600 text-white"
                  : cambiosPendientes
                    ? "bg-zinc-900 text-white hover:bg-zinc-700"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {guardado
                ? <><CheckCircle2 className="h-4 w-4" /> Guardado</>
                : "Guardar cambios"
              }
            </button>
            {cambiosPendientes && !guardado && (
              <p className="text-xs text-amber-600">Tenés cambios sin guardar</p>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-zinc-400 text-center">
        Los topes y cuotas son valores estimados vigentes a enero 2025. Verificá siempre los valores actualizados en{" "}
        <a href="https://www.argentina.gob.ar/monotributo" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600">
          argentina.gob.ar/monotributo
        </a>
      </p>
    </div>
  );
}
