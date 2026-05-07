"use client";

import { useRef, useState } from "react";
import { Upload, FileText, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = ".csv,.xlsx,.xls";
const ACCEPTED_TYPES = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];

export function UploadZone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      alert("Solo se aceptan archivos .csv, .xlsx o .xls");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo no puede superar 10MB");
      return;
    }
    onFile(file);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Zona de carga de archivo"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16",
        "cursor-pointer transition-colors select-none",
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
        isDragging ? "bg-blue-100" : "bg-zinc-100"
      )}>
        {isDragging
          ? <FileText className="h-7 w-7 text-blue-500" />
          : <Upload className="h-7 w-7 text-zinc-400" />
        }
      </div>

      <div className="text-center">
        <p className="font-semibold text-zinc-700">
          {isDragging ? "Soltá el archivo aquí" : "Arrastrá tu archivo aquí"}
        </p>
        <p className="text-sm text-zinc-400 mt-1">
          o hacé clic para seleccionar · máx. 10MB
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-100 rounded px-2 py-1">
            <FileText className="h-3 w-3" /> CSV
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-100 rounded px-2 py-1">
            <FileSpreadsheet className="h-3 w-3" /> Excel (.xlsx)
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-100 rounded px-2 py-1">
            <FileSpreadsheet className="h-3 w-3" /> Excel (.xls)
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
