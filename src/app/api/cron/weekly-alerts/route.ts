import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase";
import type { UsuarioRow } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("*")
    .in("plan_type", ["pro", "premium"])
    .eq("status", "active");

  if (error) {
    console.error("[cron/weekly-alerts] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!usuarios || usuarios.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const results = await Promise.allSettled(
    (usuarios as UsuarioRow[]).map((u) => sendWeeklyAlert(u))
  );

  const sent  = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`[cron/weekly-alerts] sent=${sent} failed=${failed}`);
  return NextResponse.json({ sent, failed });
}

async function sendWeeklyAlert(usuario: UsuarioRow) {
  const isPremium = usuario.plan_type === "premium";
  const firstName = usuario.email.split("@")[0];

  await resend.emails.send({
    from: "AlMargen <alertas@almargen.site>",
    to: usuario.email,
    subject: "Tu resumen semanal de monotributo",
    html: buildEmailHtml({ firstName, isPremium }),
  });
}

function buildEmailHtml({
  firstName,
  isPremium,
}: {
  firstName: string;
  isPremium: boolean;
}) {
  const planLabel = isPremium ? "Premium" : "Pro";
  const dashboardUrl = "https://almargen.site/dashboard";
  const proyeccionUrl = "https://almargen.site/dashboard/proyeccion";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu resumen semanal — AlMargen</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:28px 36px;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Al<span style="color:#34d399;">Margen</span>
              </span>
              <span style="display:inline-block;margin-left:10px;font-size:11px;font-weight:600;color:#a1a1aa;letter-spacing:0.5px;text-transform:uppercase;">${planLabel}</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#18181b;">
                Hola, ${firstName} 👋
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                Este es tu recordatorio semanal para revisar tu estado fiscal en AlMargen.
                Mantener tu semáforo actualizado te evita sorpresas con la recategorización.
              </p>

              <!-- CTA principal -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#18181b;border-radius:8px;">
                    <a href="${dashboardUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Ver mi semáforo →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;" />

              <!-- Tips section -->
              <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#18181b;text-transform:uppercase;letter-spacing:0.5px;">
                Recordatorios de la semana
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:10px 14px;background:#f9fafb;border-radius:8px;margin-bottom:8px;">
                    <p style="margin:0;font-size:14px;color:#3f3f46;">
                      📊 &nbsp;<strong>Cargá tus comprobantes del mes</strong> para mantener el semáforo actualizado
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:10px 14px;background:#f9fafb;border-radius:8px;">
                    <p style="margin:0;font-size:14px;color:#3f3f46;">
                      📅 &nbsp;<strong>Proyección a 6 meses:</strong> revisá cuánto podés facturar sin riesgo
                      &nbsp;<a href="${proyeccionUrl}" style="color:#059669;text-decoration:none;font-weight:600;">Ver proyección →</a>
                    </p>
                  </td>
                </tr>
                ${isPremium ? `<tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:10px 14px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
                    <p style="margin:0;font-size:14px;color:#78350f;">
                      ⚠️ &nbsp;<strong>Cruce ARCA:</strong> verificá que tus gastos no superen 1.5× tus ingresos declarados
                    </p>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;background:#fafafa;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
                Recibís este email porque tenés un plan ${planLabel} activo en
                <a href="https://almargen.site" style="color:#52525b;">almargen.site</a>.
                Los valores son estimados. Verificá siempre en
                <a href="https://www.argentina.gob.ar/monotributo" style="color:#52525b;">argentina.gob.ar/monotributo</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
