"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, RotateCcw, Download, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadZone } from "@/components/csv/upload-zone";
import { ColumnMapper } from "@/components/csv/column-mapper";
import { PreviewTable } from "@/components/csv/preview-table";
import {
  parsearArchivo, convertirATransacciones, generarPlantillaExcel,
  type ColumnMapping, type CSVRaw,
} from "@/lib/csv-parser";
import { useDashboard } from "@/lib/store";

type Estado = "idle" | "parsing" | "preview" | "importing" | "success" | "error";

function descargarPlantilla() {
  generarPlantillaExcel();
}

export default function CargarPage() {
  const router = useRouter();
  const { cargarTransacciones, agregarTransacciones, resetear, tieneDataReal } = useDashboard();

  const [estado, setEstado]       = useState<Estado>("idle");
  const [csvRaw, setCsvRaw]       = useState<CSVRaw | null>(null);
  const [mapping, setMapping]     = useState<ColumnMapping>({ fecha: null, monto: null, tipo: null, descripcion: null });
  const [errorMsg, setErrorMsg]   = useState("");
  const [importCount, setImportCount] = useState(0);
  const [erroresImport, setErroresImport] = useState<{ fila: number; motivo: string }[]>([]);
  const [modoImport, setModoImport] = useState<"reemplazar" | "agregar">("agregar");

  async function handleFile(file: File) {
    setEstado("parsing");
    try {
      const raw = await parsearArchivo(file);
      if (raw.rows.length === 0) throw new Error("El archivo está vacío o no tiene filas válidas.");
      setCsvRaw(raw);
      setMapping(raw.mapping);
      setEstado("preview");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar el archivo.");
      setEstado("error");
    }
  }

  function handleImport() {
    if (!csvRaw) return;
    if (!mapping.fecha || !mapping.monto) {
      alert("Debés mapear al menos las columnas Fecha y Monto.");
      return;
    }
    setEstado("importing");
    setTimeout(() => {
      const { transacciones, errores } = convertirATransacciones(csvRaw.rows, mapping);
      if (transacciones.length === 0) {
        setErrorMsg("No se pudo importar ninguna transacción. Revisá el mapeo de columnas.");
        setEstado("error");
        return;
      }
      if (modoImport === "agregar" && tieneDataReal) {
        agregarTransacciones(transacciones);
      } else {
        cargarTransacciones(transacciones);
      }
      setImportCount(transacciones.length);
      setErroresImport(errores);
      setEstado("success");
    }, 400);
  }

  function reiniciar() {
    setCsvRaw(null);
    setMapping({ fecha: null, monto: null, tipo: null, descripcion: null });
    setErrorMsg("");
    setEstado("idle");
  }

  if (estado === "success") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Cargar datos</h2>
          <p className="text-zinc-500 mt-0.5 text-sm">Importá tus movimientos</p>
        </div>
        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900">¡Datos importados!</p>
              <p className="text-zinc-500 mt-1">
                Se cargaron <strong>{importCount} transacciones</strong> correctamente.
              </p>
              {erroresImport.length > 0 && (
                <p className="text-amber-600 text-sm mt-1">
                  {erroresImport.length} filas no pudieron importarse (fechas o montos inválidos).
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={reiniciar}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Cargar otro
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                Ver Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Cargar datos</h2>
          <p className="text-zinc-500 mt-0.5 text-sm">Importá tus movimientos</p>
        </div>
        <Card>
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900">Error al procesar el archivo</p>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs">{errorMsg}</p>
            </div>
            <button
              onClick={reiniciar}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Intentar de nuevo
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Cargar datos</h2>
          <p className="text-zinc-500 mt-0.5 text-sm">
            Importá tus movimientos de ingresos y egresos de los últimos 12 meses
          </p>
        </div>
        {tieneDataReal && (
          <button
            onClick={() => { resetear(); reiniciar(); }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Volver a datos de ejemplo
          </button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-700">Formato esperado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-500">
            Aceptamos archivos <strong>CSV</strong> o <strong>Excel (.xlsx / .xls)</strong>. El archivo debe tener al menos
            columnas de <code className="bg-zinc-100 px-1 rounded text-xs">fecha</code> y{" "}
            <code className="bg-zinc-100 px-1 rounded text-xs">monto</code>. También puede incluir{" "}
            <code className="bg-zinc-100 px-1 rounded text-xs">tipo</code> (ingreso/egreso) y{" "}
            <code className="bg-zinc-100 px-1 rounded text-xs">descripcion</code>.
          </p>
          <button
            onClick={descargarPlantilla}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar plantilla
          </button>
        </CardContent>
      </Card>

      {(estado === "idle" || estado === "parsing") && (
        <UploadZone onFile={handleFile} disabled={estado === "parsing"} />
      )}

      {estado === "parsing" && (
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Procesando CSV...
        </div>
      )}

      {(estado === "preview" || estado === "importing") && csvRaw && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>
              <strong>{csvRaw.rows.length}</strong> filas detectadas ·{" "}
              <strong>{csvRaw.headers.length}</strong> columnas
              {csvRaw.autoDetectado && (
                <span className="ml-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  Columnas detectadas automáticamente
                </span>
              )}
            </span>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-700">
                {csvRaw.autoDetectado ? "Revisá el mapeo de columnas" : "Configurá el mapeo de columnas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ColumnMapper headers={csvRaw.headers} mapping={mapping} onChange={setMapping} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-700">Vista previa y edición</CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewTable
                headers={csvRaw.headers}
                rows={csvRaw.rows}
                mapping={mapping}
                onRowsChange={(updatedRows) => setCsvRaw({ ...csvRaw, rows: updatedRows })}
              />
            </CardContent>
          </Card>

          {tieneDataReal && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm font-medium text-zinc-700 mb-3">Ya tenés datos cargados. ¿Qué querés hacer?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setModoImport("agregar")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    modoImport === "agregar"
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-semibold">Agregar al historial</p>
                  <p className={`text-xs mt-0.5 ${modoImport === "agregar" ? "text-zinc-300" : "text-zinc-400"}`}>
                    Se suman los nuevos movimientos sin borrar los anteriores
                  </p>
                </button>
                <button
                  onClick={() => setModoImport("reemplazar")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    modoImport === "reemplazar"
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-semibold">Reemplazar todo</p>
                  <p className={`text-xs mt-0.5 ${modoImport === "reemplazar" ? "text-zinc-300" : "text-zinc-400"}`}>
                    Se borran los datos anteriores y se cargan solo los del archivo
                  </p>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={reiniciar}
              disabled={estado === "importing"}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!mapping.fecha || !mapping.monto || estado === "importing"}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2 text-sm text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {estado === "importing"
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Importando...</>
                : <><ArrowRight className="h-4 w-4" /> Importar {csvRaw.rows.length} transacciones</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
