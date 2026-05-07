import { verifyWebhook } from "@clerk/backend/webhooks";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const email = (data as { email_addresses?: { email_address: string }[] })
      .email_addresses?.[0]?.email_address ?? "";
    await createAdminClient()
      .from("usuarios")
      .upsert(
        { clerk_id: data.id, email, updated_at: new Date().toISOString() },
        { onConflict: "clerk_id" }
      );
  }

  if (type === "user.deleted") {
    await createAdminClient()
      .from("usuarios")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("clerk_id", data.id);
  }

  return new Response("ok", { status: 200 });
}
