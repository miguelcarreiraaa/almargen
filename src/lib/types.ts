import type { EstadoSemaforo } from "./monotributo-config";

export interface Transaccion {
  id: string;
  fecha: string; // 'YYYY-MM-DD'
  monto: number; // pesos argentinos, siempre positivo
  tipo: "ingreso" | "egreso";
  descripcion: string;
}

export interface ConfigUsuario {
  categoriaActualId: string; // 'A' | 'B' | ... | 'K'
  actividad: "servicios" | "bienes";
}

export interface DatosMensual {
  mesKey: string;   // 'YYYY-MM' — para ordenar
  mesLabel: string; // 'May \'25' — para mostrar
  ingresos: number;
  egresos: number;
}

export interface ProyeccionMes {
  mesKey: string;
  mesLabel: string;
  ingresoEstimado: number;   // estimado basado en promedio reciente
  ingresoQueDropea: number;  // ingreso de este mes hace 12 meses (sale de la ventana)
  netChange: number;         // ingresoEstimado - ingresoQueDropea
  total12m: number;          // total acumulado 12m proyectado
  porcentajeTope: number;
  estado: EstadoSemaforo;
}

export interface MontoSeguroPorMes {
  mesKey: string;
  mesLabel: string;
  ingresoQueDropea: number;
  montoParaQuedarVerde: number;     // facturar esto o menos → estado verde
  montoParaQuedarAmarillo: number;  // facturar esto o menos → amarillo (no rojo)
  montoMaximoSinExceder: number;    // facturar esto o menos → no superar límite
}

export interface ResumenDashboard {
  facturacion12m: number;
  gastos12m: number;
  promedioMensualReciente: number;   // promedio de los últimos 3 meses completos
  porcentajeTope: number;            // 0 a 1+ respecto al límite de categoría
  montoRestante: number;             // pesos que faltan para el tope
  diasHastaLimite: number | null;    // días proyectados hasta superar el tope
  fechaProyectadaLimite: Date | null;
  categoriaActualId: string;
  categoriaSiguienteId: string | null;
  limiteAnualActual: number;
  estadoSemaforo: EstadoSemaforo;
  ratioGastosIngresos: number; // gastos / ingresos; ARCA alerta si > 1.5
}
