import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Transaccion } from "./types";

// ─── Tipos ──────────────────────────────────────────────────────��────────────

export interface ColumnMapping {
  fecha: string | null;
  monto: string | null;
  tipo: string | null;        // null → infiere del signo del monto
  descripcion: string | null; // null → "Sin descripción"
}

export interface CSVRaw {
  headers: string[];
  rows: Record<string, string>[];
  mapping: ColumnMapping;
  autoDetectado: boolean;
}

export interface ImportResult {
  transacciones: Transaccion[];
  errores: { fila: number; motivo: string }[];
}

// ─── Patrones de detección automática ────────────────────────────────────────

const PATRONES: Record<keyof ColumnMapping, RegExp> = {
  fecha:       /^(fecha|date|f|dia|day|periodo|fecha_op|fecha_movimiento|fecha_operacion|created_at)$/i,
  monto:       /^(monto|amount|importe|total|valor|price|credito_debito|credit|debit|suma|haber|debe)$/i,
  tipo:        /^(tipo|type|operacion|movimiento|categoria|kind|estado|class)$/i,
  descripcion: /^(descripcion|description|detalle|concepto|desc|referencia|detail|motivo|glosa|narrative)$/i,
};

// ─── Helpers de parseo ────────────────────────────────────────────────────────

function parsearFecha(valor: string): string | null {
  const v = valor.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.substring(0, 10); // YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}/.test(v)) {
    const [d, m, y] = v.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{2}-\d{2}-\d{4}/.test(v)) {
    const [d, m, y] = v.split("-");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}\/\d{2}\/\d{2}/.test(v)) return v.replace(/\//g, "-").substring(0, 10);
  return null;
}

function parsearMonto(valor: string): number | null {
  let v = valor.trim().replace(/[$\s]/g, "");
  const negativo = v.startsWith("-") || v.startsWith("(");
  v = v.replace(/[()]/g, "").replace(/^-/, "");
  // Formato argentino: 1.234,56
  if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(v)) {
    v = v.replace(/\./g, "").replace(",", ".");
  } else {
    // US: 1,234.56
    v = v.replace(/,/g, "");
  }
  const num = parseFloat(v);
  if (isNaN(num)) return null;
  return negativo ? -Math.abs(num) : num;
}

function parsearTipo(valorTipo: string | undefined, montoNumerico: number): "ingreso" | "egreso" {
  if (valorTipo) {
    const v = valorTipo.toLowerCase().trim();
    if (/ingreso|credit|acredit|entrada|cobro|cr\b|haber|positivo/.test(v)) return "ingreso";
    if (/egreso|debit|debito|salida|gasto|pago|db\b|debe|negativo/.test(v)) return "egreso";
  }
  return montoNumerico >= 0 ? "ingreso" : "egreso";
}

// ─── Funciones principales ────────────────────────────────────────────────────

export function detectarMapping(headers: string[]): { mapping: ColumnMapping; autoDetectado: boolean } {
  const mapping: ColumnMapping = { fecha: null, monto: null, tipo: null, descripcion: null };

  for (const header of headers) {
    const h = header.trim();
    if (!mapping.fecha       && PATRONES.fecha.test(h))       mapping.fecha       = header;
    if (!mapping.monto       && PATRONES.monto.test(h))       mapping.monto       = header;
    if (!mapping.tipo        && PATRONES.tipo.test(h))        mapping.tipo        = header;
    if (!mapping.descripcion && PATRONES.descripcion.test(h)) mapping.descripcion = header;
  }

  const autoDetectado = !!(mapping.fecha && mapping.monto);
  return { mapping, autoDetectado };
}

export function convertirATransacciones(rows: Record<string, string>[], mapping: ColumnMapping): ImportResult {
  const transacciones: Transaccion[] = [];
  const errores: { fila: number; motivo: string }[] = [];

  rows.forEach((row, idx) => {
    const fila = idx + 2; // +2: header row + 1-based

    const fechaRaw = mapping.fecha ? row[mapping.fecha] ?? "" : "";
    const montoRaw = mapping.monto ? row[mapping.monto] ?? "" : "";
    const tipoRaw  = mapping.tipo  ? row[mapping.tipo]  ?? undefined : undefined;
    const descRaw  = mapping.descripcion ? row[mapping.descripcion] ?? "" : "";

    const fecha = parsearFecha(fechaRaw);
    if (!fecha) {
      errores.push({ fila, motivo: `Fecha inválida: "${fechaRaw}"` });
      return;
    }

    const montoNum = parsearMonto(montoRaw);
    if (montoNum === null) {
      errores.push({ fila, motivo: `Monto inválido: "${montoRaw}"` });
      return;
    }

    const tipo = parsearTipo(tipoRaw, montoNum);
    const monto = Math.abs(montoNum);
    const descripcion = descRaw.trim() || "Sin descripción";

    transacciones.push({
      id: `csv-${fila}-${Date.now()}`,
      fecha,
      monto,
      tipo,
      descripcion,
    });
  });

  return { transacciones, errores };
}

export function parsearArchivoCSV(file: File): Promise<CSVRaw> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const rows = result.data;
        const { mapping, autoDetectado } = detectarMapping(headers);
        resolve({ headers, rows, mapping, autoDetectado });
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export function parsearArchivoExcel(file: File): Promise<CSVRaw> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames.find((n) => /movimiento|datos|data/i.test(n)) ?? workbook.SheetNames[workbook.SheetNames.length - 1];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        if (json.length === 0) throw new Error("La hoja de Excel está vacía.");
        const headers = Object.keys(json[0]);
        const rows = json.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [
              k,
              v instanceof Date
                ? v.toISOString().slice(0, 10)
                : String(v ?? ""),
            ])
          )
        );
        const { mapping, autoDetectado } = detectarMapping(headers);
        resolve({ headers, rows, mapping, autoDetectado });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Error al leer el archivo Excel."));
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
}

export function parsearArchivo(file: File): Promise<CSVRaw> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") return parsearArchivoExcel(file);
  return parsearArchivoCSV(file);
}

export function generarPlantillaExcel(): void {
  const wb = XLSX.utils.book_new();

  // ── Hoja de instrucciones ──────────────────────────────────────────────────
  const instrucciones = [
    ["📋 PLANTILLA AlMargen — Instrucciones"],
    [""],
    ["Columna",    "Obligatoria", "Formato aceptado",                  "Ejemplo"],
    ["fecha",      "✅ Sí",       "YYYY-MM-DD o DD/MM/YYYY",           "2026-04-15"],
    ["monto",      "✅ Sí",       "Número en pesos. Negativo = egreso", "1500000"],
    ["tipo",       "No",          "\"ingreso\" o \"egreso\"",           "ingreso"],
    ["descripcion","No",          "Texto libre",                        "Consultoría proyecto X"],
    [""],
    ["💡 Si no incluís la columna \"tipo\", AlMargen infiere el tipo por el signo del monto."],
    ["💡 Podés agregar más columnas — se van a ignorar automáticamente."],
    ["💡 Completá la hoja \"Mis movimientos\" con tus datos y subila a AlMargen."],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(instrucciones);
  wsInfo["!cols"] = [{ wch: 16 }, { wch: 14 }, { wch: 36 }, { wch: 26 }];
  // Título grande
  if (wsInfo["A1"]) {
    wsInfo["A1"].s = { font: { bold: true, sz: 14, color: { rgb: "1A1A2E" } }, fill: { fgColor: { rgb: "E8F4FD" } } };
  }
  // Encabezados de tabla
  ["A3","B3","C3","D3"].forEach((ref) => {
    if (wsInfo[ref]) wsInfo[ref].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F2937" } }, alignment: { horizontal: "center" } };
  });
  XLSX.utils.book_append_sheet(wb, wsInfo, "📋 Instrucciones");

  // ── Hoja de datos ──────────────────────────────────────────────────────────
  const datos = [
    ["fecha",       "monto",   "tipo",     "descripcion"],
    ["2026-04-15",  1500000,   "ingreso",  "Consultoría proyecto X"],
    ["2026-04-20",  800000,    "ingreso",  "Desarrollo sprint 2"],
    ["2026-04-25",  -350000,   "egreso",   "Alquiler coworking"],
    ["2026-04-28",  -200000,   "egreso",   "Gastos personales"],
  ];
  const wsData = XLSX.utils.aoa_to_sheet(datos);
  wsData["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 30 }];

  // Encabezados en negrita con fondo oscuro
  ["A1","B1","C1","D1"].forEach((ref) => {
    if (wsData[ref]) wsData[ref].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1F2937" } }, alignment: { horizontal: "center" } };
  });
  // Filas de ingreso en verde claro
  ["A2","B2","C2","D2","A3","B3","C3","D3"].forEach((ref) => {
    if (wsData[ref]) wsData[ref].s = { fill: { fgColor: { rgb: "F0FDF4" } } };
  });
  // Filas de egreso en rojo claro
  ["A4","B4","C4","D4","A5","B5","C5","D5"].forEach((ref) => {
    if (wsData[ref]) wsData[ref].s = { fill: { fgColor: { rgb: "FEF2F2" } } };
  });

  XLSX.utils.book_append_sheet(wb, wsData, "Mis movimientos");

  // Descargar
  XLSX.writeFile(wb, "plantilla-almargen.xlsx");
}

export function generarPlantillaCSV(): string {
  const rows = [
    ["fecha", "monto", "tipo", "descripcion"],
    ["2026-04-15", "1500000", "ingreso", "Consultoría proyecto X"],
    ["2026-04-20", "800000",  "ingreso", "Desarrollo sprint 2"],
    ["2026-04-25", "350000",  "egreso",  "Alquiler coworking"],
    ["2026-04-28", "200000",  "egreso",  "Gastos personales"],
  ];
  return rows.map((r) => r.join(",")).join("\n");
}
