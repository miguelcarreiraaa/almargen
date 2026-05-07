"use client";

import { formatearFecha, formatearPeso } from "@/lib/calculos";
import { CATEGORIAS_BIENES, CATEGORIAS_SERVICIOS } from "@/lib/monotributo-config";
import type { ConfigUsuario, ResumenDashboard } from "@/lib/types";
import { AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";

interface Props {
  resumen: ResumenDashboard;
  config: ConfigUsuario;
}

export function Recomendaciones({ resumen, config }: Props) {
  const {
    estadoSemaforo,
    facturacion12m,
    limiteAnualActual,
    porcentajeTope,
    diasHastaLimite,
    fechaProyectadaLimite,
    categoriaSiguienteId,
    promedioMensualReciente,
    montoRestante,
  } = resumen;

  const tabla = config.actividad === "servicios" ? CATEGORIAS_SERVICIOS : CATEGORIAS_BIENES;
  const catSiguiente = tabla.find((c) => c.id === categoriaSiguienteId);

  const styles = {
    verde:    { bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />, title: "text-emerald-800" },
    amarillo: { bg: "bg-amber-50 border-amber-200",     icon: <AlertCircle  className="h-5 w-5 text-amber-600   shrink-0 mt-0.5" />, title: "text-amber-800"   },
    rojo:     { bg: "bg-red-50 border-red-200",         icon: <AlertCircle  className="h-5 w-5 text-red-600     shrink-0 mt-0.5" />, title: "text-red-800"     },
    excedido: { bg: "bg-red-100 border-red-400",        icon: <XCircle      className="h-5 w-5 text-red-700     shrink-0 mt-0.5" />, title: "text-red-900"    },
  }[estadoSemaforo];

  const pct = (porcentajeTope * 100).toFixed(1);
  const fechaStr = fechaProyectadaLimite ? formatearFecha(fechaProyectadaLimite) : null;

  const mensaje = {
    verde: (
      <>
        <strong>Tu facturación está en zona segura.</strong> Llevas {formatearPeso(facturacion12m, true)} acumulados ({pct}% del tope).
        Podés facturar hasta {formatearPeso(montoRestante, true)} más antes de llegar al límite de Categoría {resumen.categoriaActualId}.
      </>
    ),
    amarillo: (
      <>
        <strong>Atención:</strong> ya usaste el {pct}% de tu tope anual. Con el ritmo actual de{" "}
        {formatearPeso(promedioMensualReciente, true)}/mes, <strong>alcanzarías el límite de Categoría {resumen.categoriaActualId} alrededor del {fechaStr}</strong>{" "}
        (en aproximadamente {diasHastaLimite} días).
        {catSiguiente && ` Al superarlo, pasarías a Categoría ${catSiguiente.id} (cuota mensual: ${formatearPeso(catSiguiente.cuotaMensual)}).`}
        {" "}Considerá frenar la facturación o preparar la recategorización.
      </>
    ),
    rojo: (
      <>
        <strong>⚠ Peligro:</strong> estás al {pct}% del tope de Categoría {resumen.categoriaActualId}.{" "}
        {fechaStr && <><strong>A este ritmo superarías el límite el {fechaStr}</strong> ({diasHastaLimite} días). </>}
        {catSiguiente
          ? `Iniciá el trámite de recategorización a Categoría ${catSiguiente.id} (cuota: ${formatearPeso(catSiguiente.cuotaMensual)}/mes) antes de que te excluyan.`
          : "Consultá con tu contador lo antes posible."}
      </>
    ),
    excedido: (
      <>
        <strong>Tope superado.</strong> Superaste el límite de Categoría {resumen.categoriaActualId} ({formatearPeso(limiteAnualActual, true)} anuales).
        {catSiguiente
          ? ` Debés recategorizarte a Categoría ${catSiguiente.id} de forma inmediata para evitar sanciones de ARCA.`
          : " Estás por encima de todas las categorías de monotributo. Consultá con tu contador sobre el pase a Responsable Inscripto."}
      </>
    ),
  }[estadoSemaforo];

  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm ${styles.bg}`}>
      {styles.icon}
      <p className={`leading-relaxed ${styles.title}`}>{mensaje}</p>
    </div>
  );
}
