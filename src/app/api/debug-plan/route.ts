import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "no auth" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const keyPreview = serviceKey
    ? `${serviceKey.charCodeAt(0) === 0xfeff ? "BOM+" : ""}${serviceKey.slice(0, 12)}...`
    : "MISSING";

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  return Response.json({ userId, keyPreview, data, error: error?.message });
}
