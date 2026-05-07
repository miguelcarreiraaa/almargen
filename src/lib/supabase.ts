import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type PlanType = "free" | "pro" | "premium";

export interface UsuarioRow {
  id: string;
  clerk_id: string;
  email: string;
  mp_preapproval_id: string | null;
  trial_ends_at: string | null;
  plan_type: PlanType;
  status: "active" | "inactive" | "cancelled";
  created_at: string;
  updated_at: string;
}

export async function getUsuarioPorClerkId(clerkId: string): Promise<UsuarioRow | null> {
  const { data } = await createAdminClient()
    .from("usuarios")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();
  return data;
}

export async function upsertUsuario(
  clerkId: string,
  email: string,
  planType: PlanType = "free"
): Promise<void> {
  await createAdminClient()
    .from("usuarios")
    .upsert(
      { clerk_id: clerkId, email, plan_type: planType, updated_at: new Date().toISOString() },
      { onConflict: "clerk_id" }
    );
}

export async function actualizarPlan(
  clerkId: string,
  planType: PlanType,
  opts?: { mpPreapprovalId?: string; trialEndsAt?: string }
): Promise<void> {
  const payload: Record<string, unknown> = {
    plan_type: planType,
    status: "active",
    updated_at: new Date().toISOString(),
  };
  if (opts?.mpPreapprovalId !== undefined) payload.mp_preapproval_id = opts.mpPreapprovalId;
  if (opts?.trialEndsAt !== undefined) payload.trial_ends_at = opts.trialEndsAt;

  await createAdminClient()
    .from("usuarios")
    .update(payload)
    .eq("clerk_id", clerkId);
}

export async function cancelarPlan(clerkId: string): Promise<void> {
  await createAdminClient()
    .from("usuarios")
    .update({
      plan_type: "free",
      status: "active",
      mp_preapproval_id: null,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_id", clerkId);
}
