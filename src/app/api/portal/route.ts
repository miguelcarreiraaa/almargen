import { auth } from "@clerk/nextjs/server";
import { preApproval } from "@/lib/mercadopago";
import { createAdminClient, cancelarPlan } from "@/lib/supabase";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("usuarios")
    .select("mp_preapproval_id, plan_type")
    .eq("clerk_id", userId)
    .single();

  const preapprovalId = data?.mp_preapproval_id as string | undefined;

  if (!preapprovalId) {
    return Response.json({ error: "No hay suscripción activa" }, { status: 404 });
  }

  await preApproval.update({
    id: preapprovalId,
    body: { status: "cancelled" },
  });

  await cancelarPlan(userId);

  return Response.json({ success: true });
}
