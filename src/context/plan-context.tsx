"use client";
import { createContext, useContext } from "react";

export type PlanType = "free" | "pro" | "estudio";

const PlanCtx = createContext<PlanType>("free");

export function PlanProvider({
  planType,
  children,
}: {
  planType: PlanType;
  children: React.ReactNode;
}) {
  return <PlanCtx.Provider value={planType}>{children}</PlanCtx.Provider>;
}

export function usePlan(): PlanType {
  return useContext(PlanCtx);
}

export function canAccess(plan: PlanType, required: "pro"): boolean {
  return plan === "pro" || plan === "estudio";
}
