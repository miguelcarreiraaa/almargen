// ─────────────────────────────────────────────────────────────────────────────
// TABLA DE PARÁMETROS — MONOTRIBUTO ARGENTINA (ARCA)
// Última actualización: enero 2025 (Resolución General ARCA)
// IMPORTANTE: estos valores se ajustan periódicamente por inflación.
// Para actualizar, reemplazá los `limiteAnual` con los topes vigentes.
// Fuente oficial: https://www.argentina.gob.ar/monotributo
// ─────────────────────────────────────────────────────────────────────────────

export type ActividadTipo = "servicios" | "bienes" | "ambas";

export interface CategoriaMonotributo {
  id: string;                  // "A", "B", ..., "K"
  limiteAnual: number;         // Tope de facturación bruta anual (en pesos)
  cuotaMensual: number;        // Cuota fija mensual total estimada (impuesto + obra social + jubilación)
  actividad: ActividadTipo;
  descripcion?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS — ACTIVIDAD DE SERVICIOS
// Vigente desde enero 2025 (ajuste trimestral ARCA)
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORIAS_SERVICIOS: CategoriaMonotributo[] = [
  {
    id: "A",
    limiteAnual: 7_718_136,
    cuotaMensual: 27_910,
    actividad: "servicios",
    descripcion: "Hasta $7.7M anuales",
  },
  {
    id: "B",
    limiteAnual: 11_380_394,
    cuotaMensual: 33_120,
    actividad: "servicios",
    descripcion: "Hasta $11.4M anuales",
  },
  {
    id: "C",
    limiteAnual: 16_000_539,
    cuotaMensual: 40_460,
    actividad: "servicios",
    descripcion: "Hasta $16M anuales",
  },
  {
    id: "D",
    limiteAnual: 22_313_458,
    cuotaMensual: 49_720,
    actividad: "servicios",
    descripcion: "Hasta $22.3M anuales",
  },
  {
    id: "E",
    limiteAnual: 29_708_499,
    cuotaMensual: 64_960,
    actividad: "servicios",
    descripcion: "Hasta $29.7M anuales",
  },
  {
    id: "F",
    limiteAnual: 37_313_788,
    cuotaMensual: 79_410,
    actividad: "servicios",
    descripcion: "Hasta $37.3M anuales",
  },
  {
    id: "G",
    limiteAnual: 47_458_096,
    cuotaMensual: 97_050,
    actividad: "servicios",
    descripcion: "Hasta $47.5M anuales",
  },
  {
    id: "H",
    limiteAnual: 69_484_779,
    cuotaMensual: 140_230,
    actividad: "servicios",
    descripcion: "Hasta $69.5M anuales (solo servicios)",
  },
  {
    id: "I",
    limiteAnual: 100_000_000,
    cuotaMensual: 197_850,
    actividad: "servicios",
    descripcion: "Hasta $100M anuales (solo servicios)",
  },
  {
    id: "J",
    limiteAnual: 130_000_000,
    cuotaMensual: 254_010,
    actividad: "servicios",
    descripcion: "Hasta $130M anuales (solo servicios)",
  },
  {
    id: "K",
    limiteAnual: 160_000_000,
    cuotaMensual: 310_170,
    actividad: "servicios",
    descripcion: "Hasta $160M anuales (solo servicios)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS — VENTA DE BIENES MUEBLES
// Las categorías H–K no aplican para venta de bienes.
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORIAS_BIENES: CategoriaMonotributo[] = [
  { id: "A", limiteAnual: 7_718_136,  cuotaMensual: 27_910,  actividad: "bienes" },
  { id: "B", limiteAnual: 11_380_394, cuotaMensual: 33_120,  actividad: "bienes" },
  { id: "C", limiteAnual: 16_000_539, cuotaMensual: 40_460,  actividad: "bienes" },
  { id: "D", limiteAnual: 22_313_458, cuotaMensual: 49_720,  actividad: "bienes" },
  { id: "E", limiteAnual: 29_708_499, cuotaMensual: 64_960,  actividad: "bienes" },
  { id: "F", limiteAnual: 37_313_788, cuotaMensual: 79_410,  actividad: "bienes" },
  { id: "G", limiteAnual: 47_458_096, cuotaMensual: 97_050,  actividad: "bienes" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PARÁMETROS GENERALES DEL RÉGIMEN
// ─────────────────────────────────────────────────────────────────────────────
export const PARAMETROS_GENERALES = {
  // Si los gastos personales superan este factor sobre los ingresos declarados,
  // ARCA considera que los ingresos están subdeclarados ("cruce de datos").
  factorGastosPersonales: 1.5,

  // Porcentaje del tope a partir del cual se activa la alerta amarilla
  umbralAlertaAmarilla: 0.80,  // 80% del tope anual

  // Porcentaje del tope a partir del cual se activa la alerta roja
  umbralAlertaRoja: 0.95,      // 95% del tope anual

  // Ventana de tiempo para el cálculo (meses móviles hacia atrás)
  ventanaMeses: 12,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna la categoría en la que cae un monto de facturación anual dado.
 * Si supera todas las categorías, retorna null (excluido del régimen).
 */
export function obtenerCategoria(
  montoAnual: number,
  actividad: "servicios" | "bienes" = "servicios"
): CategoriaMonotributo | null {
  const tabla =
    actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
  return tabla.find((cat) => montoAnual <= cat.limiteAnual) ?? null;
}

/**
 * Retorna la categoría siguiente (a la que se pasaría si se supera la actual).
 */
export function obtenerCategoriaSiguiente(
  categoriaActualId: string,
  actividad: "servicios" | "bienes" = "servicios"
): CategoriaMonotributo | null {
  const tabla =
    actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
  const idx = tabla.findIndex((c) => c.id === categoriaActualId);
  return idx >= 0 && idx < tabla.length - 1 ? tabla[idx + 1] : null;
}

export type EstadoSemaforo = "verde" | "amarillo" | "rojo" | "excedido";

/**
 * Dado un monto facturado en los últimos 12 meses y la categoría actual,
 * determina el estado del semáforo.
 */
export function calcularEstadoSemaforo(
  facturacionUltimos12Meses: number,
  categoriaActualId: string,
  actividad: "servicios" | "bienes" = "servicios"
): EstadoSemaforo {
  const tabla =
    actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
  const categoria = tabla.find((c) => c.id === categoriaActualId);
  if (!categoria) return "excedido";

  const ratio = facturacionUltimos12Meses / categoria.limiteAnual;

  if (ratio >= 1) return "excedido";
  if (ratio >= PARAMETROS_GENERALES.umbralAlertaRoja) return "rojo";
  if (ratio >= PARAMETROS_GENERALES.umbralAlertaAmarilla) return "amarillo";
  return "verde";
}

export const COLORES_SEMAFORO: Record<EstadoSemaforo, { bg: string; text: string; border: string; label: string }> = {
  verde:    { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-300", label: "En zona segura" },
  amarillo: { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-300",   label: "Zona de alerta" },
  rojo:     { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-300",     label: "Peligro de recategorización" },
  excedido: { bg: "bg-red-100",     text: "text-red-900",     border: "border-red-500",     label: "Tope superado — excluido del régimen" },
};
