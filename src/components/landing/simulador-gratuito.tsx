"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Lock, ArrowRight, RotateCcw, Loader2, Upload } from "lucide-react";
import { parsearArchivoCSV, convertirATransacciones, type ColumnMapping } from "@/lib/csv-parser";
import { calcularResumen } from "@/lib/calculos";
import { CATEGORIAS_SERVICIOS, CATEGORIAS_BIENES, COLORES_SEMAFORO } from "@/lib/monotributo-config";
import { formatearPeso } from "@/lib/calculos";
import type { ConfigUsuario, Transaccion } from "@/lib/types";
import { cn } from "@/lib/utils";

type SimEstado = "idle" | "procesando" | "resultado" | "error";

const ICONO_SEMAFORO = { verde: "🟢", amarillo: "🟡", rojo: "🔴", excedido: "🚨" };

export function SimuladorGratuito() {
  const [estado, setEstado]             = useState<SimEstado>("idle");
  const [errorMsg, setErrorMsg]         = useState("");
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [config, setConfig]             = useState<ConfigUsuario>({
    categoriaActualId: "D",
    actividad: "servicios",
  });

  const tabla = config.actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;

  const resumen = useMemo(() => {
    if (transacciones.length === 0) return null;
    return calcularResumen(transacciones, config, new Date());
  }, [transacciones, config]);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Solo se aceptan archivos .csv");
      setEstado("error");
      return;
    }
    setEstado("procesando");
    try {
      const raw = await parsearArchivoCSV(file);
      if (raw.rows.length === 0) throw new Error("El archivo está vacío.");
      const mapping: ColumnMapping = raw.mapping;
      if (!mapping.fecha || !mapping.monto) throw new Error("No se detectaron columnas de fecha y monto.");
      const { transacciones: txs } = convertirATransacciones(raw.rows, mapping);
      if (txs.length === 0) throw new Error("No se pudo interpretar ninguna fila.");
      setTransacciones(txs);
      setEstado("resultado");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar el archivo.");
      setEstado("error");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function reiniciar() {
    setTransacciones([]);
    setErrorMsg("");
    setEstado("idle");
  }

  // ── Resultado ──────────────────────────────────────────────────────
  if (estado === "resultado" && resumen) {
    const colores = COLORES_SEMAFORO[resumen.estadoSemaforo];
    const pct = Math.min(resumen.porcentajeTope * 100, 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Config rápida */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-sm">
          <span className="text-zinc-500 font-medium">Configuración:</span>
          <select
            value={config.actividad}
            onChange={(e) => setConfig(c => ({ ...c, actividad: e.target.value as "servicios" | "bienes" }))}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
            <option value="servicios">Servicios</option>
            <option value="bienes">Venta de bienes</option>
          </select>
          <span className="text-zinc-400">Categoría:</span>
          <div className="flex gap-1.5 flex-wrap">
            {tabla.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setConfig(c => ({ ...c, categoriaActualId: cat.id }))}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-bold transition-colors",
                  config.categoriaActualId === cat.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                )}
              >
                {cat.id}
              </button>
            ))}
          </div>
          <button onClick={reiniciar} className="ml-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
            <RotateCcw className="h-3 w-3" /> Nuevo CSV
          </button>
        </div>

        {/* Semáforo — VISIBLE */}
        <div className={cn("rounded-2xl border p-6", colores.bg, colores.border)}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">
                Facturación 12 meses — Categoría {resumen.categoriaActualId}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ICONO_SEMAFORO[resumen.estadoSemaforo]}</span>
                <div>
                  <p className={cn("text-2xl font-bold tabular-nums", colores.text)}>
                    {(resumen.porcentajeTope * 100).toFixed(1)}%
                  </p>
                  <p className={cn("text-xs font-medium", colores.text)}>{colores.label}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400">Facturado 12m</p>
              <p className="font-bold text-zinc-900 tabular-nums text-lg">
                {formatearPeso(resumen.facturacion12m, true)}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Límite: {formatearPeso(resumen.limiteAnualActual, true)}</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-white/50 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", {
                "bg-emerald-500": resumen.estadoSemaforo === "verde",
                "bg-amber-500":   resumen.estadoSemaforo === "amarillo",
                "bg-red-500":     resumen.estadoSemaforo === "rojo" || resumen.estadoSemaforo === "excedido",
              })}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Promedio mensual (últimos 3 meses): {formatearPeso(resumen.promedioMensualReciente, true)} ·{" "}
            {transacciones.length} transacciones procesadas
          </p>
        </div>

        {/* Análisis de gastos — BLOQUEADO */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200">
          <div className="blur-sm pointer-events-none select-none p-6 bg-zinc-50 space-y-3">
            <p className="text-sm font-semibold text-zinc-700">Cruce de datos ARCA</p>
            <div className="h-3 w-full rounded-full bg-zinc-200" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-zinc-200 rounded-xl" />
              <div className="h-16 bg-zinc-200 rounded-xl" />
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <Lock className="h-6 w-6 text-zinc-700 mb-2" />
            <p className="text-sm font-semibold text-zinc-800">Análisis ARCA</p>
            <p className="text-xs text-zinc-500 mt-0.5 mb-4 text-center px-6">
              Disponible en Plan Pro — detecta si tus gastos te ponen en la mira del ARCA
            </p>
            <Link
              href="/precios"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Desbloquear <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Proyección — BLOQUEADA */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200">
          <div className="blur-sm pointer-events-none select-none p-6 bg-zinc-50 space-y-3">
            <p className="text-sm font-semibold text-zinc-700">Proyección 6 meses</p>
            <div className="space-y-2">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-16 bg-zinc-200 rounded" />
                  <div className="flex-1 h-3 bg-zinc-200 rounded-full" style={{ opacity: 1 - i * 0.1 }} />
                  <div className="h-3 w-10 bg-zinc-200 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <Lock className="h-6 w-6 text-zinc-700 mb-2" />
            <p className="text-sm font-semibold text-zinc-800">Proyección a 6 meses</p>
            <p className="text-xs text-zinc-500 mt-0.5 mb-4 text-center px-6">
              Sabé cuánto podés facturar cada mes para no pasarte de categoría
            </p>
            <Link
              href="/precios"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Ver planes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────
  if (estado === "error") {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4">
        <p className="text-red-600 text-sm">{errorMsg}</p>
        <button
          onClick={reiniciar}
          className="flex items-center gap-2 mx-auto rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Intentar de nuevo
        </button>
      </div>
    );
  }

  // ── Idle / procesando ──────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-8 py-16 cursor-pointer hover:border-zinc-400 hover:bg-zinc-100 transition-colors group"
      >
        {estado === "procesando" ? (
          <>
            <Loader2 className="h-10 w-10 text-zinc-400 animate-spin" />
            <p className="text-sm text-zinc-500">Procesando CSV...</p>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm group-hover:border-zinc-300 transition-colors">
              <Upload className="h-6 w-6 text-zinc-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-700">Arrastrá tu CSV acá</p>
              <p className="text-xs text-zinc-400 mt-1">o hacé click para elegir un archivo</p>
            </div>
            <p className="text-xs text-zinc-400 bg-white border border-zinc-200 rounded-full px-3 py-1">
              Columnas esperadas: fecha, monto, tipo (opcional)
            </p>
          </>
        )}
        <input
          type="file"
          accept=".csv"
          className="sr-only"
          disabled={estado === "procesando"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
    </div>
  );
}
