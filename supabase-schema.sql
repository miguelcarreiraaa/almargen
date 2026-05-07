-- ─── Tabla de usuarios ──────────────────────────────────────────────
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Versión: Mercado Pago (reemplaza Stripe)

CREATE TABLE IF NOT EXISTS usuarios (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id            TEXT        UNIQUE NOT NULL,
  email               TEXT        NOT NULL,
  mp_preapproval_id   TEXT,
  trial_ends_at       TIMESTAMPTZ,
  plan_type           TEXT        DEFAULT 'free'
                                  CHECK (plan_type IN ('free', 'pro', 'premium')),
  status              TEXT        DEFAULT 'active'
                                  CHECK (status IN ('active', 'inactive', 'cancelled')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_clerk_id       ON usuarios(clerk_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_mp_preapproval ON usuarios(mp_preapproval_id);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: solo el service_role puede escribir
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON usuarios
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── Migración desde esquema anterior con Stripe ─────────────────────
-- Solo ejecutar si ya tenés la tabla con stripe_customer_id:
--
-- ALTER TABLE usuarios
--   DROP COLUMN IF EXISTS stripe_customer_id,
--   ADD COLUMN IF NOT EXISTS mp_preapproval_id TEXT,
--   ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
--
-- CREATE INDEX IF NOT EXISTS idx_usuarios_mp_preapproval ON usuarios(mp_preapproval_id);
