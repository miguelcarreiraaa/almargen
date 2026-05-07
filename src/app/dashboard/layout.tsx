export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/sidebar";
import { Providers } from "@/components/providers";
import { PlanProvider, type PlanType } from "@/context/plan-context";
import { getUsuarioPorClerkId } from "@/lib/supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let planType: PlanType = "free";

  if (userId) {
    const usuario = await getUsuarioPorClerkId(userId);
    console.log("[layout] userId:", userId, "| usuario:", JSON.stringify(usuario));
    planType = usuario?.plan_type ?? "free";
  }

  return (
    <Providers>
      <PlanProvider planType={planType}>
        <div className="flex h-screen bg-zinc-50">
          <Sidebar />
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </PlanProvider>
    </Providers>
  );
}
