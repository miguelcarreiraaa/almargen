import { MercadoPagoConfig, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? "TEST-placeholder",
});

export const preApproval = new PreApproval(client);

export type PlanKey = "pro_mensual" | "pro_anual" | "premium_mensual" | "premium_anual";

export const PLAN_CONFIG: Record<
  PlanKey,
  {
    reason: string;
    amount: number;
    frequency: number;
    frequency_type: "months" | "days";
    plan_type: "pro" | "premium";
  }
> = {
  pro_mensual: {
    reason: "AlMargen Pro — Mensual",
    amount: 7900,
    frequency: 1,
    frequency_type: "months",
    plan_type: "pro",
  },
  pro_anual: {
    reason: "AlMargen Pro — Anual",
    amount: 79000,
    frequency: 12,
    frequency_type: "months",
    plan_type: "pro",
  },
  premium_mensual: {
    reason: "AlMargen Premium — Mensual",
    amount: 25000,
    frequency: 1,
    frequency_type: "months",
    plan_type: "premium",
  },
  premium_anual: {
    reason: "AlMargen Premium — Anual",
    amount: 225000,
    frequency: 12,
    frequency_type: "months",
    plan_type: "premium",
  },
};

export const TRIAL_DAYS = 7;
