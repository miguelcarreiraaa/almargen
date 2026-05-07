// Datos de demostración — usuario freelancer en zona AMARILLA (Cat. D, ~87%)
// La fecha de referencia es fija para que SSR y cliente produzcan el mismo resultado.

import { agruparPorMes, calcularResumen } from "./calculos";
import type { ConfigUsuario, Transaccion } from "./types";

export const CONFIG_USUARIO_EJEMPLO: ConfigUsuario = {
  categoriaActualId: "D",
  actividad: "servicios",
};

export const TRANSACCIONES_EJEMPLO: Transaccion[] = [
  // Mayo 2025 — ingresos: $1.300.000
  { id: "t01", fecha: "2025-05-08", monto: 520_000, tipo: "ingreso", descripcion: "Diseño UI — Cliente A" },
  { id: "t02", fecha: "2025-05-20", monto: 480_000, tipo: "ingreso", descripcion: "Dev backend — Cliente B" },
  { id: "t03", fecha: "2025-05-25", monto: 300_000, tipo: "ingreso", descripcion: "Consultoría puntual" },
  { id: "t04", fecha: "2025-05-28", monto: 350_000, tipo: "egreso",  descripcion: "Alquiler coworking + servicios" },
  { id: "t05", fecha: "2025-05-30", monto: 250_000, tipo: "egreso",  descripcion: "Gastos personales mayo" },
  // Junio 2025 — ingresos: $1.350.000
  { id: "t06", fecha: "2025-06-05", monto: 600_000, tipo: "ingreso", descripcion: "Proyecto e-commerce" },
  { id: "t07", fecha: "2025-06-18", monto: 550_000, tipo: "ingreso", descripcion: "Mantenimiento mensual" },
  { id: "t08", fecha: "2025-06-20", monto: 200_000, tipo: "ingreso", descripcion: "Soporte técnico" },
  { id: "t09", fecha: "2025-06-28", monto: 400_000, tipo: "egreso",  descripcion: "Gastos personales junio" },
  // Julio 2025 — ingresos: $1.400.000
  { id: "t10", fecha: "2025-07-03", monto: 700_000, tipo: "ingreso", descripcion: "Desarrollo app móvil" },
  { id: "t11", fecha: "2025-07-15", monto: 480_000, tipo: "ingreso", descripcion: "Integración API" },
  { id: "t12", fecha: "2025-07-20", monto: 220_000, tipo: "ingreso", descripcion: "Correcciones diseño" },
  { id: "t13", fecha: "2025-07-29", monto: 420_000, tipo: "egreso",  descripcion: "Gastos personales julio" },
  // Agosto 2025 — ingresos: $1.600.000
  { id: "t14", fecha: "2025-08-06", monto: 800_000, tipo: "ingreso", descripcion: "Landing page premium" },
  { id: "t15", fecha: "2025-08-14", monto: 600_000, tipo: "ingreso", descripcion: "Consultoría estratégica" },
  { id: "t16", fecha: "2025-08-22", monto: 200_000, tipo: "ingreso", descripcion: "Soporte mensual" },
  { id: "t17", fecha: "2025-08-29", monto: 480_000, tipo: "egreso",  descripcion: "Gastos personales agosto" },
  // Septiembre 2025 — ingresos: $1.500.000
  { id: "t18", fecha: "2025-09-04", monto: 700_000, tipo: "ingreso", descripcion: "Rediseño plataforma" },
  { id: "t19", fecha: "2025-09-16", monto: 650_000, tipo: "ingreso", descripcion: "Integración pagos" },
  { id: "t20", fecha: "2025-09-24", monto: 150_000, tipo: "ingreso", descripcion: "Ajustes menores" },
  { id: "t21", fecha: "2025-09-30", monto: 500_000, tipo: "egreso",  descripcion: "Gastos personales septiembre" },
  // Octubre 2025 — ingresos: $1.700.000
  { id: "t22", fecha: "2025-10-02", monto: 850_000, tipo: "ingreso", descripcion: "Sistema de gestión" },
  { id: "t23", fecha: "2025-10-15", monto: 600_000, tipo: "ingreso", descripcion: "Automatización de procesos" },
  { id: "t24", fecha: "2025-10-22", monto: 250_000, tipo: "ingreso", descripcion: "Consultoría técnica" },
  { id: "t25", fecha: "2025-10-30", monto: 520_000, tipo: "egreso",  descripcion: "Gastos personales octubre" },
  // Noviembre 2025 — ingresos: $1.650.000
  { id: "t26", fecha: "2025-11-05", monto: 900_000, tipo: "ingreso", descripcion: "Proyecto e-learning" },
  { id: "t27", fecha: "2025-11-14", monto: 650_000, tipo: "ingreso", descripcion: "Plataforma SaaS" },
  { id: "t28", fecha: "2025-11-21", monto: 100_000, tipo: "ingreso", descripcion: "Fix urgente" },
  { id: "t29", fecha: "2025-11-28", monto: 600_000, tipo: "egreso",  descripcion: "Gastos personales noviembre" },
  // Diciembre 2025 — ingresos: $1.550.000
  { id: "t30", fecha: "2025-12-03", monto: 750_000, tipo: "ingreso", descripcion: "Cierre anual — Cliente A" },
  { id: "t31", fecha: "2025-12-12", monto: 600_000, tipo: "ingreso", descripcion: "Migración infraestructura" },
  { id: "t32", fecha: "2025-12-20", monto: 200_000, tipo: "ingreso", descripcion: "Guardias fin de año" },
  { id: "t33", fecha: "2025-12-27", monto: 700_000, tipo: "egreso",  descripcion: "Gastos personales diciembre" },
  // Enero 2026 — ingresos: $1.750.000
  { id: "t34", fecha: "2026-01-08", monto: 950_000, tipo: "ingreso", descripcion: "Proyecto IA — Sprint 1" },
  { id: "t35", fecha: "2026-01-16", monto: 600_000, tipo: "ingreso", descripcion: "Dashboard analytics" },
  { id: "t36", fecha: "2026-01-24", monto: 200_000, tipo: "ingreso", descripcion: "Revisión de arquitectura" },
  { id: "t37", fecha: "2026-01-30", monto: 620_000, tipo: "egreso",  descripcion: "Gastos personales enero" },
  // Febrero 2026 — ingresos: $1.800.000
  { id: "t38", fecha: "2026-02-05", monto: 950_000, tipo: "ingreso", descripcion: "Proyecto IA — Sprint 2" },
  { id: "t39", fecha: "2026-02-14", monto: 650_000, tipo: "ingreso", descripcion: "Rediseño brand identity" },
  { id: "t40", fecha: "2026-02-21", monto: 200_000, tipo: "ingreso", descripcion: "Mantenimiento plataforma" },
  { id: "t41", fecha: "2026-02-28", monto: 600_000, tipo: "egreso",  descripcion: "Gastos personales febrero" },
  // Marzo 2026 — ingresos: $1.850.000
  { id: "t42", fecha: "2026-03-06", monto: 1_000_000, tipo: "ingreso", descripcion: "Proyecto IA — Sprint 3" },
  { id: "t43", fecha: "2026-03-14", monto: 650_000,   tipo: "ingreso", descripcion: "App fintech" },
  { id: "t44", fecha: "2026-03-22", monto: 200_000,   tipo: "ingreso", descripcion: "Soporte y mantenimiento" },
  { id: "t45", fecha: "2026-03-28", monto: 700_000,   tipo: "egreso",  descripcion: "Gastos personales marzo" },
  // Abril 2026 — ingresos: $1.900.000
  { id: "t46", fecha: "2026-04-04", monto: 1_100_000, tipo: "ingreso", descripcion: "Proyecto IA — Sprint 4" },
  { id: "t47", fecha: "2026-04-11", monto: 600_000,   tipo: "ingreso", descripcion: "Consultoría estratégica Q2" },
  { id: "t48", fecha: "2026-04-22", monto: 200_000,   tipo: "ingreso", descripcion: "Mantenimiento mensual" },
  { id: "t49", fecha: "2026-04-30", monto: 700_000,   tipo: "egreso",  descripcion: "Gastos personales abril" },
];

// Pre-calculado con fecha fija para evitar diferencias entre SSR y cliente
const HOY_DEMO = new Date(2026, 4, 3); // 3 de mayo de 2026

export const RESUMEN_EJEMPLO = calcularResumen(
  TRANSACCIONES_EJEMPLO,
  CONFIG_USUARIO_EJEMPLO,
  HOY_DEMO
);

export const DATOS_MENSUALES_EJEMPLO = agruparPorMes(TRANSACCIONES_EJEMPLO, HOY_DEMO);
