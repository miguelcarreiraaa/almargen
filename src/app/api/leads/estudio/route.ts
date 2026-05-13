import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, whatsapp, estimated_clients, message } = body;

  if (!name || !email || !whatsapp || !estimated_clients) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error: dbError } = await supabase
    .from("estudio_leads")
    .insert({ name, email, whatsapp, estimated_clients, message: message || null });

  if (dbError) {
    console.error("[leads/estudio] Supabase:", dbError);
    return NextResponse.json({ error: "Error al guardar el lead" }, { status: 500 });
  }

  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (notificationEmail) {
    await resend.emails.send({
      from: "AlMargen <alertas@almargen.site>",
      to: notificationEmail,
      subject: `Nuevo lead Estudio: ${name}`,
      html: buildNotificationHtml({ name, email, whatsapp, estimated_clients, message }),
    }).catch((err) => console.error("[leads/estudio] Resend:", err));
  }

  return NextResponse.json({ ok: true });
}

function buildNotificationHtml({
  name, email, whatsapp, estimated_clients, message,
}: {
  name: string;
  email: string;
  whatsapp: string;
  estimated_clients: number;
  message?: string | null;
}) {
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
    <div style="background:#18181b;padding:20px 24px;">
      <span style="font-size:16px;font-weight:700;color:#fff;">Al<span style="color:#34d399;">Margen</span></span>
      <span style="margin-left:8px;font-size:11px;color:#a1a1aa;">Nuevo lead — Plan Estudio</span>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#71717a;width:40%;">Nombre</td><td style="padding:8px 0;font-weight:600;color:#18181b;">${name}</td></tr>
        <tr style="border-top:1px solid #f4f4f5;"><td style="padding:8px 0;color:#71717a;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#18181b;">${email}</a></td></tr>
        <tr style="border-top:1px solid #f4f4f5;"><td style="padding:8px 0;color:#71717a;">WhatsApp</td><td style="padding:8px 0;"><a href="${waLink}" style="color:#1fa36b;font-weight:600;">${whatsapp}</a></td></tr>
        <tr style="border-top:1px solid #f4f4f5;"><td style="padding:8px 0;color:#71717a;">Clientes est.</td><td style="padding:8px 0;font-weight:600;color:#18181b;">${estimated_clients}</td></tr>
        ${message ? `<tr style="border-top:1px solid #f4f4f5;"><td style="padding:8px 0;color:#71717a;vertical-align:top;">Mensaje</td><td style="padding:8px 0;color:#18181b;">${message}</td></tr>` : ""}
      </table>
      <div style="margin-top:20px;">
        <a href="${waLink}" style="display:inline-block;background:#1fa36b;color:#fff;font-weight:600;font-size:13px;padding:10px 20px;border-radius:8px;text-decoration:none;">
          Contactar por WhatsApp →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}
