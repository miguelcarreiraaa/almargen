import { auth } from "@clerk/nextjs/server";
import { getUsuarioPorClerkId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "no auth", userId: null });

  const usuario = await getUsuarioPorClerkId(userId);
  return Response.json({ userId, usuario });
}
