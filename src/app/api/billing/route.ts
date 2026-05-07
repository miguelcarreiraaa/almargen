import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("usuarios")
    .select("plan_type, status, mp_preapproval_id, trial_ends_at")
    .eq("clerk_id", userId)
    .single();

  return Response.json(
    data ?? { plan_type: "free", status: "active", mp_preapproval_id: null, trial_ends_at: null }
  );
}
