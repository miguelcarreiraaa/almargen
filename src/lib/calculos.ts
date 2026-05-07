import {
  CATEGORIAS_BIENES,
  CATEGORIAS_SERVICIOS,
  PARAMETROS_GENERALES,
  calcularEstadoSemaforo,
  obtenerCategoriaSiguiente,
} from "./monotributo-config";
import type {
  ConfigUsuario, DatosMensual, MontoSeguroPorMes,
  ProyeccionMes, ResumenDashboard, Transaccion,
} from "./types";

// ─── Helpers de fecha ────────────────────────────────────────────────────────

const MES_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function mesKeyToLabel(mesKey: string): string {
  const [year, month] = mesKey.split("-");
  return `${MES_LABELS[parseInt(month) - 1]} '${year.slice(2)}`;
}

function getMesKey(fecha: string): string {
  return fecha.substring(0, 7);
}

function getLast12MonthKeys(today: Date): string[] {
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

// Retorna los últimos N meses COMPLETOS (sin contar el mes actual)
function getLastNCompleteMonthKeys(n: number, today: Date): string[] {
  const keys: string[] = [];
  for (let i = n; i >= 1; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

// ─── Agrupación mensual ───────────────────────────────────────────────────────

export function agruparPorMes(transacciones: Transaccion[], today = new Date()): DatosMensual[] {
  const months = getLast12MonthKeys(today);
  const map = new Map<string, { ingresos: number; egresos: number }>();
  months.forEach((k) => map.set(k, { ingresos: 0, egresos: 0 }));

  for (const t of transacciones) {
    const k = getMesKey(t.fecha);
    const entry = map.get(k);
    if (!entry) continue;
    if (t.tipo === "ingreso") entry.ingresos += t.monto;
    else entry.egresos += t.monto;
  }

  return months.map((k) => ({
    mesKey: k,
    mesLabel: mesKeyToLabel(k),
    ingresos: map.get(k)?.ingresos ?? 0,
    egresos: map.get(k)?.egresos ?? 0,
  }));
}

// ─── Cálculo del resumen principal ───────────────────────────────────────────

export function calcularResumen(
  transacciones: Transaccion[],
  config: ConfigUsuario,
  today = new Date()
): ResumenDashboard {
  const keys12m = getLast12MonthKeys(today);
  const tx12m = transacciones.filter((t) => keys12m.includes(getMesKey(t.fecha)));

  const facturacion12m = tx12m
    .filter((t) => t.tipo === "ingreso")
    .reduce((s, t) => s + t.monto, 0);

  const gastos12m = tx12m
    .filter((t) => t.tipo === "egreso")
    .reduce((s, t) => s + t.monto, 0);

  const tabla = config.actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
  const catActual = tabla.find((c) => c.id === config.categoriaActualId) ?? tabla[tabla.length - 1];
  const catSiguiente = obtenerCategoriaSiguiente(config.categoriaActualId, config.actividad);

  const limiteAnualActual = catActual.limiteAnual;
  const porcentajeTope = facturacion12m / limiteAnualActual;
  const montoRestante = Math.max(0, limiteAnualActual - facturacion12m);

  // Promedio de los últimos 3 meses completos
  const recentKeys = getLastNCompleteMonthKeys(3, today);
  const recentTotal = transacciones
    .filter((t) => t.tipo === "ingreso" && recentKeys.includes(getMesKey(t.fecha)))
    .reduce((s, t) => s + t.monto, 0);
  const promedioMensualReciente = recentKeys.length > 0
    ? recentTotal / recentKeys.length
    : facturacion12m / 12;

  // Proyección: cuántos días hasta tocar el tope
  let diasHastaLimite: number | null = null;
  let fechaProyectadaLimite: Date | null = null;

  if (promedioMensualReciente > 0 && montoRestante > 0) {
    const meses = montoRestante / promedioMensualReciente;
    diasHastaLimite = Math.round(meses * 30);
    fechaProyectadaLimite = new Date(today);
    fechaProyectadaLimite.setDate(fechaProyectadaLimite.getDate() + diasHastaLimite);
  }

  return {
    facturacion12m,
    gastos12m,
    promedioMensualReciente,
    porcentajeTope,
    montoRestante,
    diasHastaLimite,
    fechaProyectadaLimite,
    categoriaActualId: catActual.id,
    categoriaSiguienteId: catSiguiente?.id ?? null,
    limiteAnualActual,
    estadoSemaforo: calcularEstadoSemaforo(facturacion12m, config.categoriaActualId, config.actividad),
    ratioGastosIngresos: facturacion12m > 0 ? gastos12m / facturacion12m : 0,
  };
}

// ─── Formateo ─────────────────────────────────────────────────────────────────

export function formatearPeso(amount: number, compacto = false): string {
  if (compacto) {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

// ─── Proyección mes a mes (ventana rodante exacta) ────────────────────────────

export function calcularProyeccionMensual(
  transacciones: Transaccion[],
  config: ConfigUsuario,
  mesesProyectar = 6,
  today = new Date()
): ProyeccionMes[] {
  const tabla = config.actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
  const cat = tabla.find((c) => c.id === config.categoriaActualId) ?? tabla[tabla.length - 1];
  const limite = cat.limiteAnual;

  // Mapa de ingresos históricos por mes
  const ingPorMes = new Map<string, number>();
  for (const t of transacciones) {
    if (t.tipo !== "ingreso") continue;
    const k = getMesKey(t.fecha);
    ingPorMes.set(k, (ingPorMes.get(k) ?? 0) + t.monto);
  }

  // Total acumulado 12m actual
  const keys12m = getLast12MonthKeys(today);
  let rolling = keys12m.reduce((s, k) => s + (ingPorMes.get(k) ?? 0), 0);

  // Promedio reciente (últimos 3 meses completos)
  const recentKeys = getLastNCompleteMonthKeys(3, today);
  const recentTotal = recentKeys.reduce((s, k) => s + (ingPorMes.get(k) ?? 0), 0);
  const avgReciente = recentKeys.length > 0 ? recentTotal / recentKeys.length : rolling / 12;

  const resultado: ProyeccionMes[] = [];

  for (let i = 1; i <= mesesProyectar; i++) {
    const futuro = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const mesKey = `${futuro.getFullYear()}-${String(futuro.getMonth() + 1).padStart(2, "0")}`;

    // Ingreso que cae fuera de la ventana (mes equivalente del año pasado)
    const antiguo = new Date(futuro.getFullYear(), futuro.getMonth() - 12, 1);
    const antiguoKey = `${antiguo.getFullYear()}-${String(antiguo.getMonth() + 1).padStart(2, "0")}`;
    const ingresoQueDropea = ingPorMes.get(antiguoKey) ?? 0;

    const netChange = avgReciente - ingresoQueDropea;
    rolling = rolling + netChange;
    const porcentajeTope = rolling / limite;

    resultado.push({
      mesKey,
      mesLabel: mesKeyToLabel(mesKey),
      ingresoEstimado: avgReciente,
      ingresoQueDropea,
      netChange,
      total12m: rolling,
      porcentajeTope,
      estado:
        porcentajeTope >= 1 ? "excedido" :
        porcentajeTope >= PARAMETROS_GENERALES.umbralAlertaRoja ? "rojo" :
        porcentajeTope >= PARAMETROS_GENERALES.umbralAlertaAmarilla ? "amarillo" :
        "verde",
    });
  }

  return resultado;
}

// ─── Monto seguro para el próximo mes ────────────────────────────────────────

export function calcularMontoSeguroMes(
  rolling12mActual: number,
  transacciones: Transaccion[],
  limiteAnual: number,
  today = new Date()
): MontoSeguroPorMes {
  const mesNext = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const mesKey = `${mesNext.getFullYear()}-${String(mesNext.getMonth() + 1).padStart(2, "0")}`;

  // El ingreso que caerá fuera de la ventana cuando entre el próximo mes
  const antiguo = new Date(mesNext.getFullYear(), mesNext.getMonth() - 12, 1);
  const antiguoKey = `${antiguo.getFullYear()}-${String(antiguo.getMonth() + 1).padStart(2, "0")}`;
  const ingPorMes = new Map<string, number>();
  for (const t of transacciones) {
    if (t.tipo !== "ingreso") continue;
    const k = getMesKey(t.fecha);
    ingPorMes.set(k, (ingPorMes.get(k) ?? 0) + t.monto);
  }
  const ingresoQueDropea = ingPorMes.get(antiguoKey) ?? 0;

  // Base del rolling después del dropoff, sin contar el nuevo mes
  const basePostDropoff = rolling12mActual - ingresoQueDropea;

  return {
    mesKey,
    mesLabel: mesKeyToLabel(mesKey),
    ingresoQueDropea,
    montoParaQuedarVerde:    Math.max(0, limiteAnual * PARAMETROS_GENERALES.umbralAlertaAmarilla - basePostDropoff),
    montoParaQuedarAmarillo: Math.max(0, limiteAnual * PARAMETROS_GENERALES.umbralAlertaRoja - basePostDropoff),
    montoMaximoSinExceder:   Math.max(0, limiteAnual - basePostDropoff),
  };
}
