"use client";

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { calcularResumen, agruparPorMes } from "./calculos";
import { CONFIG_USUARIO_EJEMPLO, TRANSACCIONES_EJEMPLO } from "./datos-ejemplo";
import type { ConfigUsuario, DatosMensual, ResumenDashboard, Transaccion } from "./types";

const STORAGE_KEY = "almargen_v1";

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface DashboardCtx {
  transacciones: Transaccion[];
  config: ConfigUsuario;
  resumen: ResumenDashboard;
  datosMensuales: DatosMensual[];
  tieneDataReal: boolean;
  cargarTransacciones: (t: Transaccion[]) => void;
  agregarTransacciones: (t: Transaccion[]) => void;
  actualizarConfig: (c: Partial<ConfigUsuario>) => void;
  resetear: () => void;
}

const Ctx = createContext<DashboardCtx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [transacciones, setTransacciones] = useState<Transaccion[]>(TRANSACCIONES_EJEMPLO);
  const [config, setConfig]               = useState<ConfigUsuario>(CONFIG_USUARIO_EJEMPLO);
  const [tieneDataReal, setTieneDataReal] = useState(false);

  // Leer localStorage después del mount (evita mismatch SSR/cliente)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data = JSON.parse(stored);
      if (Array.isArray(data.transacciones) && data.transacciones.length > 0) {
        setTransacciones(data.transacciones);
        setTieneDataReal(true);
      }
      if (data.config) setConfig(data.config);
    } catch {
      // localStorage corrupto → mantener defaults
    }
  }, []);

  const cargarTransacciones = useCallback((t: Transaccion[]) => {
    setTransacciones(t);
    setTieneDataReal(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const prev = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, transacciones: t }));
    } catch { /* noop */ }
  }, []);

  const agregarTransacciones = useCallback((nuevas: Transaccion[]) => {
    setTransacciones((prev) => {
      const existentes = new Set(
        prev.map((t) => `${t.fecha}|${t.monto}|${t.descripcion}`)
      );
      const sinDuplicados = nuevas.filter(
        (t) => !existentes.has(`${t.fecha}|${t.monto}|${t.descripcion}`)
      );
      const merged = [...prev, ...sinDuplicados].sort((a, b) => a.fecha.localeCompare(b.fecha));
      setTieneDataReal(true);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, transacciones: merged }));
      } catch { /* noop */ }
      return merged;
    });
  }, []);

  const actualizarConfig = useCallback((partial: Partial<ConfigUsuario>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, config: next }));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  const resetear = useCallback(() => {
    setTransacciones(TRANSACCIONES_EJEMPLO);
    setConfig(CONFIG_USUARIO_EJEMPLO);
    setTieneDataReal(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }, []);

  const resumen        = useMemo(() => calcularResumen(transacciones, config), [transacciones, config]);
  const datosMensuales = useMemo(() => agruparPorMes(transacciones),           [transacciones]);

  return (
    <Ctx.Provider value={{
      transacciones, config, resumen, datosMensuales,
      tieneDataReal, cargarTransacciones, agregarTransacciones, actualizarConfig, resetear,
    }}>
      {children}
    </Ctx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboard(): DashboardCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard debe usarse dentro de <DashboardProvider>");
  return ctx;
}
