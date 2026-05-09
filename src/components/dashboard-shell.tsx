"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50">

      {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — fijo en mobile como drawer, estático en desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 transition-transform duration-200 md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header mobile con hamburguesa */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-zinc-100 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 text-zinc-600" />
          </button>
          <span className="text-base font-bold text-zinc-900 tracking-tight">
            Al<span className="text-emerald-500">Margen</span>
          </span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
