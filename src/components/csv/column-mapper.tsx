"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { ColumnMapping } from "@/lib/csv-parser";

interface Props {
  headers: string[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
}

const CAMPOS: {
  key: keyof ColumnMapping;
  label: string;
  requerido: boolean;
  hint: string;
}[] = [
  { key: "fecha",       label: "Fecha",       requerido: true,  hint: "Ej: 2026-04-15 o 15/04/2026" },
  { key: "monto",       label: "Monto ($)",   requerido: true,  hint: "Número en pesos. Negativo = egreso" },
  { key: "tipo",        label: "Tipo",        requerido: false, hint: "\"ingreso\" o \"egreso\" (opcional)" },
  { key: "descripcion", label: "Descripción", requerido: false, hint: "Concepto o detalle (opcional)" },
];

export function ColumnMapper({ headers, mapping, onChange }: Props) {
  const [mostrarManual, setMostrarManual] = useState(false);

  const todoDetectado = CAMPOS.filter((c) => c.requerido).every((c) => mapping[c.key] !== null);
  const algunoFalta   = CAMPOS.filter((c) => c.requerido).some((c)  => mapping[c.key] === null);

  function set(key: keyof ColumnMapping, value: string) {
    onChange({ ...mapping, [key]: value === "" ? null : value });
  }

  return (
    <div className="space-y-4">
      {/* Estado de detección automática */}
      {todoDetectado && !mostrarManual ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            Columnas detectadas automáticamente
          </div>

          {/* Resumen visual de qué se encontró */}
          <div className="grid grid-cols-2 gap-2">
            {CAMPOS.map(({ key, label }) => {
              const col = mapping[key];
              if (!col) return null;
              return (
                <div key={key} className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                  <span className="text-xs font-medium text-zinc-500 w-20 shrink-0">{label}</span>
                  <span className="text-xs text-zinc-400">→</span>
                  <span className="text-xs font-semibold text-zinc-800 truncate">columna «{col}»</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setMostrarManual(true)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Ajustar manualmente
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {todoDetectado && (
            <button
              onClick={() => setMostrarManual(false)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              Ocultar ajuste manual
            </button>
          )}

          {algunoFalta && (
            <p className="text-sm text-amber-600">
              No pudimos detectar todas las columnas. Indicá cuál columna de tu archivo corresponde a cada campo:
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CAMPOS.map(({ key, label, requerido, hint }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  ¿Cuál columna tiene {label === "Monto ($)" ? "el Monto" : `la ${label}`}?
                  {requerido && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <select
                  value={mapping[key] ?? ""}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="">{requerido ? "— Elegí una columna —" : "— No incluir —"}</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-400">{hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
