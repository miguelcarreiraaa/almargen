import { auth, currentUser } from "@clerk/nextjs/server";
import { PLAN_CONFIG, TRIAL_DAYS, type PlanKey } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase";

const PROD_URL = "https://almargen.site";

function resolveBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const isLocal = configured.includes("localhost") || configured.includes("127.0.0.1");
  return isLocal || !configured ? PROD_URL : configured;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { priceKey } = await req.json();
  const config = PLAN_CONFIG[priceKey as PlanKey];
  if (!config) return Response.json({ error: "Plan inválido" }, { status: 400 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const baseUrl = PROD_URL;
  const backUrl         = `${baseUrl}/dashboard/billing?checkout=success`;
  const notificationUrl = `${baseUrl}/api/webhooks/mercadopago`;
  const accessToken     = process.env.MP_ACCESS_TOKEN ?? "";

  const body = {
    reason: config.reason,
    payer_email: email,
    back_url: backUrl,
    notification_url: notificationUrl,
    auto_recurring: {
      frequency: config.frequency,
      frequency_type: config.frequency_type,
      transaction_amount: config.amount,
      currency_id: "ARS",
      free_trial: {
        frequency: TRIAL_DAYS,
        frequency_type: "days",
      },
    },
    external_reference: userId,
    status: "pending",
  };

  let mpRes: Response;
  try {
    mpRes = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[checkout] fetch error:", err);
    return Response.json({ error: "Error de conexión con Mercado Pago" }, { status: 500 });
  }

  const data = await mpRes.json();

  if (!mpRes.ok) {
    console.error("[checkout] MP API error:", JSON.stringify(data));
    return Response.json({ error: "Error al crear la suscripción en Mercado Pago" }, { status: 500 });
  }

  if (!data.init_point) {
    console.error("[checkout] MP sin init_point:", JSON.stringify(data));
    return Response.json({ error: "Error al crear la suscripción en Mercado Pago" }, { status: 500 });
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await createAdminClient()
    .from("usuarios")
    .upsert(
      {
        clerk_id: userId,
        email,
        mp_preapproval_id: data.id,
        plan_type: config.plan_type,
        trial_ends_at: trialEndsAt,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id" }
    );

  return Response.json({ url: data.init_point });
}
