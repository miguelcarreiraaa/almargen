import { auth } from "@clerk/nextjs/server";
import { getUsuarioPorClerkId } from "@/lib/supabase";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

  const usuario = await getUsuarioPorClerkId(userId);
  if (usuario?.plan_type !== "premium") {
    return Response.json({ error: "Función exclusiva del plan Premium" }, { status: 403 });
  }

  const { phone, message } = (await req.json()) as { phone?: string; message?: string };
  if (!phone || !message) {
    return Response.json({ error: "phone y message son requeridos" }, { status: 400 });
  }

  // ── Twilio ────────────────────────────────────────────────────────────────
  // import twilio from "twilio";
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
  //   to:   `whatsapp:${phone}`,
  //   body: message,
  // });

  // ── Evolution API ─────────────────────────────────────────────────────────
  // await fetch(
  //   `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
  //   {
  //     method: "POST",
  //     headers: {
  //       apikey: process.env.EVOLUTION_API_KEY ?? "",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ number: phone, text: message }),
  //   }
  // );

  console.log("[WhatsApp stub] destinatario:", phone, "| mensaje:", message);
  return Response.json({ success: true, stub: true });
}
