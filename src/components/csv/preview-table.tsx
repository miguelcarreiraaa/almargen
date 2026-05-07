"use client";

import { useState } from "react";
import type { ColumnMapping } from "@/lib/csv-parser";

interface Props {
  headers: string[];
  rows: Record<string, string>[];
  mapping: ColumnMapping;
  onRowsChange?: (rows: Record<string, string>[]) => void;
}

export function PreviewTable({ headers, rows, mapping, onRowsChange }: Props) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);

  const mappedCols = Object.values(mapping).filter(Boolean) as string[];
  const tipoCol = mapping.tipo;

  function startEdit(rowIdx: number, col: string) {
    if (!mappedCols.includes(col) || !onRowsChange) return;
    setEditingCell({ row: rowIdx, col });
  }

  function commitEdit(rowIdx: number, col: string, value: string) {
    if (!onRowsChange) return;
    const updated = rows.map((r, i) => i === rowIdx ? { ...r, [col]: value } : r);
    onRowsChange(updated);
    setEditingCell(null);
  }

  function isTipoCol(col: string) {
    return col === tipoCol;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400">
        Hacé clic en cualquier celda <span className="text-blue-600 font-medium">azul</span> para editarla antes de importar.
      </p>
      <div className="overflow-auto rounded-lg border border-zinc-200 max-h-80">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-zinc-400 w-8">#</th>
              {headers.map((h) => (
                <th
                  key={h}
                  className={`px-3 py-2 text-left font-medium ${
                    mappedCols.includes(h) ? "text-blue-700 bg-blue-50" : "text-zinc-400"
                  }`}
                >
                  {h}
                  {mappedCols.includes(h) && (
                    <span className="ml-1 text-blue-400">
                      · {Object.entries(mapping).find(([, v]) => v === h)?.[0]}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50">
                <td className="px-3 py-1.5 text-zinc-300 select-none">{i + 1}</td>
                {headers.map((h) => {
                  const isEditable = mappedCols.includes(h) && !!onRowsChange;
                  const isEditing  = editingCell?.row === i && editingCell?.col === h;
                  const value      = row[h] ?? "";

                  if (isEditing) {
                    if (isTipoCol(h)) {
                      return (
                        <td key={h} className="px-1 py-0.5">
                          <select
                            autoFocus
                            value={value}
                            onChange={(e) => commitEdit(i, h, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            className="w-full rounded border border-blue-400 bg-white px-2 py-1 text-xs text-zinc-800 focus:outline-none"
                          >
                            <option value="ingreso">ingreso</option>
                            <option value="egreso">egreso</option>
                          </select>
                        </td>
                      );
                    }
                    return (
                      <td key={h} className="px-1 py-0.5">
                        <input
                          autoFocus
                          type="text"
                          defaultValue={value}
                          onBlur={(e) => commitEdit(i, h, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(i, h, (e.target as HTMLInputElement).value);
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                          className="w-full rounded border border-blue-400 bg-white px-2 py-1 text-xs text-zinc-800 focus:outline-none min-w-24"
                        />
                      </td>
                    );
                  }

                  return (
                    <td
                      key={h}
                      onClick={() => startEdit(i, h)}
                      className={`px-3 py-1.5 whitespace-nowrap max-w-48 truncate ${
                        isEditable
                          ? "text-zinc-700 cursor-pointer hover:bg-blue-50 hover:text-blue-800 rounded"
                          : "text-zinc-400"
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-400 text-right">{rows.length} fila{rows.length !== 1 ? "s" : ""} en total</p>
    </div>
  );
}
