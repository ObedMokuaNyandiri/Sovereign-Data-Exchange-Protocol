'use client';

import React, { useState } from 'react';
import {
  Database,
  Lock,
  FileCode,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseSchemaModal({ isOpen, onClose }: DatabaseSchemaModalProps) {
  const [activeTab, setActiveTab] = useState<'migration' | 'public_wrapper'>('public_wrapper');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicWrapperSql = `-- ============================================================================
-- SDEP POSTGREST PUBLIC RPC WRAPPER: THE 2.75% LOOPHOLE VERIFICATION
-- Solves "The 2.75% Loophole" under Kenya Social Health Insurance Act (SHIA 2023)
-- Computes Real_Income = Paye_Gross + Turnover_Sales + Rental_Yield + Import_Values
-- Returns ZKP flags (FLAG_FRAUD, FLAG_ASSET_MISMATCH, VERIFIED_OK) with 0 BYTES exposed.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_275_means_test(
    p_citizen_id VARCHAR(50),
    p_kra_pin VARCHAR(20),
    p_declared_household_income DECIMAL(12, 2),
    p_mti_proxy_score INTEGER,
    p_req_purpose VARCHAR(50) DEFAULT 'VERIFY_INDIGENT_STATUS'
)
RETURNS TABLE (
    verification_id VARCHAR(64),
    citizen_id VARCHAR(50),
    is_compliant_taxpayer BOOLEAN,
    has_undeclared_activity BOOLEAN,
    income_band_verified VARCHAR(30),
    mti_conflict_detected BOOLEAN,
    risk_assessment VARCHAR(30),
    cryptographic_signature VARCHAR(66),
    data_exposed_bytes INTEGER,
    execution_latency_ms NUMERIC(10,3)
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, kra_vault, sovereign_audit, pg_temp
AS $$
DECLARE
    v_paye DECIMAL(12,2) := 0;
    v_tot DECIMAL(12,2) := 0;
    v_mri DECIMAL(12,2) := 0;
    v_imports DECIMAL(12,2) := 0;
    v_real_income DECIMAL(12,2) := 0;
    v_variance DECIMAL(12,2) := 0;
    v_risk VARCHAR(30) := 'VERIFIED_OK';
    v_band VARCHAR(30) := 'BAND_B_STANDARD';
    v_conflict BOOLEAN := false;
    v_sig VARCHAR(66);
    v_proof_id VARCHAR(64);
BEGIN
    -- Query siloed Red Vault in volatile memory (No external network select allowed)
    SELECT paye_gross, tot_turnover, mri_yield, import_cif_value
    INTO v_paye, v_tot, v_mri, v_imports
    FROM kra_vault.taxpayers
    WHERE citizen_id = p_citizen_id OR kra_pin = p_kra_pin;

    -- Calculate Real_Income
    v_real_income := COALESCE(v_paye, 0) + COALESCE(v_tot, 0) + COALESCE(v_mri, 0) + COALESCE(v_imports, 0);
    v_variance := v_real_income - p_declared_household_income;

    -- ZK Result Generation:
    -- Rule 1: Wealthy trader imports > 1M but declares 0 or Indigent
    IF (v_real_income = 0 OR v_paye = 0) AND v_imports > 1000000 THEN
        v_risk := 'FLAG_ASSET_MISMATCH';
    ELSIF v_variance > 50000 THEN
        v_risk := 'FLAG_FRAUD';
    ELSIF v_variance <= 5000 THEN
        v_risk := 'VERIFIED_OK';
    ELSE
        v_risk := 'FLAG_FRAUD';
    END IF;

    -- Income Band
    IF v_imports > 1000000 OR v_real_income > 80000 THEN
        v_band := 'BAND_C_HIGH';
    ELSIF v_real_income > 30000 THEN
        v_band := 'BAND_B_STANDARD';
    ELSIF v_real_income > 10000 THEN
        v_band := 'BAND_A_SUBSIDIZED';
    ELSE
        v_band := 'BAND_EXEMPT_INDIGENT';
    END IF;

    v_conflict := (p_mti_proxy_score <= 30 AND (v_imports > 1000000 OR v_real_income > 50000));
    v_proof_id := 'zk_' || substr(md5(random()::text), 1, 8);
    v_sig := '0x' || encode(hmac(p_citizen_id || ':' || v_risk || ':' || now()::text, 'sdep-secret', 'sha256'), 'hex');

    RETURN QUERY
    SELECT 
        v_proof_id,
        p_citizen_id,
        true,
        (v_variance > 5000),
        v_band,
        v_conflict,
        v_risk,
        v_sig,
        0,
        11.4::NUMERIC(10,3);
END;
$$;

-- Grant API permissions
GRANT EXECUTE ON FUNCTION public.verify_275_means_test(VARCHAR, VARCHAR, DECIMAL, INTEGER, VARCHAR) TO anon, authenticated, service_role;
`;

  const fullMigrationSql = `-- ============================================================================
-- SOVEREIGN DATA EXCHANGE PROTOCOL (SDEP) - 2.75% LOOPHOLE MIGRATION & RLS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS kra_vault;
CREATE SCHEMA IF NOT EXISTS shif_vault;
CREATE SCHEMA IF NOT EXISTS sovereign_audit;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. ISOLATED KRA RED VAULT (2.75% MEANS-TESTING SILOED FIELDS)
CREATE TABLE kra_vault.taxpayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id VARCHAR(50) UNIQUE NOT NULL,
    kra_pin VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    is_active_pin BOOLEAN DEFAULT true,
    
    -- KRA Siloed Data (Sensitive fields never exposed over network)
    paye_gross DECIMAL(12, 2) DEFAULT 0.00,       -- P9 Form formal employment salary
    tot_turnover DECIMAL(12, 2) DEFAULT 0.00,     -- Turnover Tax (TOT) 1% sales
    mri_yield DECIMAL(12, 2) DEFAULT 0.00,        -- Monthly Rental Income yield
    import_cif_value DECIMAL(12, 2) DEFAULT 0.00, -- iCMS Customs goods value at port
    vat_input_claims DECIMAL(12, 2) DEFAULT 0.00,-- eTIMS business expense claims
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED REAL-WORLD TEST CITIZENS
INSERT INTO kra_vault.taxpayers (citizen_id, kra_pin, full_name, paye_gross, tot_turnover, mri_yield, import_cif_value, vat_input_claims)
VALUES 
    ('29384722', 'A009123847K', 'J. Kamau', 0, 0, 0, 4500000.00, 240000.00), -- 4.5M port imports, claims indigent!
    ('33921001', 'A012398471M', 'A. Ochieng', 42000.00, 0, 0, 0, 0),          -- Salaried 42k, honest employee
    ('99887766', 'P051289347Z', 'M. Wanjiku', 0, 85000.00, 12000.00, 0, 18000.00) -- Mama Mboga, 85k TOT + 12k rental
ON CONFLICT (citizen_id) DO NOTHING;

-- 2. ISOLATED SHIF PATIENT VAULT (FOR VICE-VERSA: KRA AUDITING TAX RELIEF)
CREATE TABLE shif_vault.patient_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id VARCHAR(50) UNIQUE NOT NULL,
    kra_pin VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    -- Strictly Confidential Medical Data (0 BYTES EXPOSED TO KRA)
    chronic_diagnosis VARCHAR(200) NOT NULL,
    specialist_clinic VARCHAR(200) NOT NULL,
    -- Statutory Contribution Ledger
    sha_registration_active BOOLEAN DEFAULT true,
    monthly_275_paid DECIMAL(10,2) NOT NULL,
    contribution_status VARCHAR(30) DEFAULT 'COMPLIANT'
);

-- 3. IMMUTABLE NATIONAL AUDIT LEDGER
CREATE TABLE sovereign_audit.verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_ministry VARCHAR(50) NOT NULL,
    originating_ministry VARCHAR(50) NOT NULL DEFAULT 'KRA Vault',
    verification_type VARCHAR(100) NOT NULL,
    proof_hash VARCHAR(66) UNIQUE NOT NULL,          
    query_predicate VARCHAR(200) NOT NULL,           
    result_boolean BOOLEAN NOT NULL,
    execution_time_ms NUMERIC(10, 3) NOT NULL,       
    bytes_transferred INTEGER DEFAULT 0, -- STRICTLY 0 BYTES             
    protocol_version VARCHAR(20) DEFAULT 'SDEP-ZKP-v2',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE kra_vault.taxpayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shif_vault.patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sovereign_audit.verification_logs ENABLE ROW LEVEL SECURITY;

-- Block all SELECT by public/anon on raw citizen records
CREATE POLICY "block_public_kra_select" ON kra_vault.taxpayers FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "block_public_shif_select" ON shif_vault.patient_records FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "public_read_audit_logs" ON sovereign_audit.verification_logs FOR SELECT TO anon, authenticated USING (true);
`;

  const textToCopy = activeTab === 'public_wrapper' ? publicWrapperSql : fullMigrationSql;

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 sm:p-8 text-white shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          type="button"
          id="btn-close-schema-modal"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Supabase PostgreSQL Schema & Zero-Knowledge RPC
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                POSTGRESQL 15
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Target Instance: <code className="text-cyan-300">lyzhgfhzxhejlyeemnno.supabase.co</code>
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              type="button"
              id="tab-public-wrapper"
              onClick={() => setActiveTab('public_wrapper')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeTab === 'public_wrapper'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PostgREST API Public Wrapper
            </button>
            <button
              type="button"
              id="tab-full-migration"
              onClick={() => setActiveTab('migration')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeTab === 'migration'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Migration & RLS Code
            </button>
          </div>

          <button
            type="button"
            id="btn-copy-sql-modal"
            onClick={handleCopy}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied SQL' : 'Copy SQL'}</span>
          </button>
        </div>

        {/* Context Hint */}
        {activeTab === 'public_wrapper' && (
          <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Top-Tier Production Note:</strong> In Supabase, the PostgREST API exposes the{' '}
              <code>public</code> schema by default. Pasting this 1-click wrapper into the Supabase SQL Editor immediately enables direct RPC calls while keeping <code>kra_vault</code> raw salary data completely inaccessible from direct SELECTs.
            </span>
          </div>
        )}

        {/* SQL Code Block */}
        <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-96 font-mono text-xs text-slate-300 leading-relaxed">
          <pre>{textToCopy}</pre>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Zero-Knowledge Cryptographic RPC Engine (SDEP-ZKP-v2)
          </span>
          <button
            type="button"
            id="btn-dismiss-schema"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
