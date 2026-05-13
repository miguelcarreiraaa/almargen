export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { Providers } from "@/components/providers";
import { PlanProvider, type PlanType } from "@/context/plan-context";
import { DashboardShell } from "@/components/dashboard-shell";
import { getUsuarioPorClerkId, normalizePlanType } from "@/lib/supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let planType: PlanType = "free";

  if (userId) {
    const usuario = await getUsuarioPorClerkId(userId);
    planType = normalizePlanType(usuario?.plan_type);
  }

  return (
    <Providers>
      <PlanProvider planType={planType}>
        <DashboardShell>{children}</DashboardShell>
      </PlanProvider>
    </Providers>
  );
}
