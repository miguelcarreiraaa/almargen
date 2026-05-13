import { createHmac } from "crypto";
import { TRIAL_DAYS, PLAN_CONFIG, type PlanKey } from "@/lib/mercadopago";
import { actualizarPlan, cancelarPlan } from "@/lib/supabase";

function verificarFirma(req: Request, body: string, requestId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // skip verification in dev if secret not set

  const xSignature = req.headers.get("x-signature") ?? "";
  const ts = xSignature.match(/ts=([^,]+)/)?.[1];
  const v1 = xSignature.match(/v1=([^,]+)/)?.[1];
  if (!ts || !v1) return false;

  const payload = `id:${JSON.parse(body)?.data?.id ?? ""};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected === v1;
}

export async function POST(req: Request) {
  const body = await req.text();
  const requestId = req.headers.get("x-request-id") ?? "";

  if (!verificarFirma(req, body, requestId)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { type: string; data?: { id?: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.type !== "subscription_preapproval" || !event.data?.id) {
    return new Response("ok", { status: 200 });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN ?? "";
  const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${event.data.id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!mpRes.ok) return new Response("Could not fetch preapproval", { status: 500 });
  const sub = await mpRes.json();

  const clerkId = sub.external_reference;
  if (!clerkId) return new Response("ok", { status: 200 });

  const status = sub.status;

  if (status === "authorized") {
    const startDate = sub.date_created ? new Date(sub.date_created) : new Date();
    const trialEndsAt = new Date(startDate.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const amount = sub.auto_recurring?.transaction_amount ?? 0;
    const frequency = sub.auto_recurring?.frequency ?? 1;

    const planKey = Object.entries(PLAN_CONFIG).find(
      ([, cfg]) => cfg.amount === amount && cfg.frequency === frequency
    )?.[0] as PlanKey | undefined;

    const rawPlanType = planKey ? PLAN_CONFIG[planKey].plan_type : "pro";
    const planType = rawPlanType === "premium" ? "pro" : rawPlanType;

    await actualizarPlan(clerkId, planType, {
      mpPreapprovalId: sub.id,
      trialEndsAt,
    });
  }

  if (status === "cancelled" || status === "paused") {
    await cancelarPlan(clerkId);
  }

  return new Response("ok", { status: 200 });
}
