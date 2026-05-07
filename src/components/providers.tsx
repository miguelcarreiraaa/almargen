"use client";

import { DashboardProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
