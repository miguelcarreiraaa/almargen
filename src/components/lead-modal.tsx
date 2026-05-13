"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
}

export function LeadModal({ open, onClose }: LeadModalProps) {
  const [form, setForm] = useState({
    name: "", email: "", whatsapp: "", estimated_clients: "", message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [submitted, onClose]);

  useEffect(() => {
    if (!open) {
      setForm({ name: "", email: "", whatsapp: "", estimated_clients: "", message: "" });
      setErrors({});
      setSubmitted(false);
    }
  }, [open]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Requerido";
    if (!form.email.trim()) e.email = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.whatsapp.trim()) e.whatsapp = "Requerido";
    if (!form.estimated_clients) e.estimated_clients = "Requerido";
    else if (parseInt(form.estimated_clients) < 1) e.estimated_clients = "Mínimo 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads/estudio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          estimated_clients: parseInt(form.estimated_clients),
          message: form.message.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      alert("Error al enviar. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
          <div>
            <p className="font-bold text-zinc-900">Plan Estudio</p>
            <p className="text-xs text-zinc-500 mt-0.5">Para contadores y estudios contables</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-14 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#1fa36b] mx-auto mb-4" />
            <p className="font-semibold text-zinc-900 text-lg">¡Gracias!</p>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              Te contactamos por WhatsApp<br />en menos de 24hs hábiles.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            <Field label="Nombre completo" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Juan Pérez"
                className={inputCn(!!errors.name)}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="juan@estudio.com"
                className={inputCn(!!errors.email)}
              />
            </Field>

            <Field label="WhatsApp" error={errors.whatsapp}>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                placeholder="+54 9 11 XXXX-XXXX"
                className={inputCn(!!errors.whatsapp)}
              />
            </Field>

            <Field label="Clientes monotributistas estimados" error={errors.estimated_clients}>
              <input
                type="number"
                min={1}
                value={form.estimated_clients}
                onChange={(e) => setForm((p) => ({ ...p, estimated_clients: e.target.value }))}
                placeholder="10"
                className={inputCn(!!errors.estimated_clients)}
              />
            </Field>

            <Field label="Mensaje (opcional)">
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Contanos sobre tu estudio..."
                maxLength={500}
                rows={3}
                className={cn(inputCn(false), "resize-none")}
              />
              <p className="text-xs text-zinc-400 text-right mt-1">{form.message.length}/500</p>
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1fa36b] text-[#1a1f1c] py-3 text-sm font-semibold hover:bg-[#1a8f5d] transition-colors disabled:opacity-70 mt-2"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>
                : "Enviar consulta"
              }
            </button>

          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCn(hasError: boolean): string {
  return cn(
    "w-full rounded-lg border px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
    hasError ? "border-red-300 bg-red-50" : "border-zinc-200 bg-white"
  );
}
