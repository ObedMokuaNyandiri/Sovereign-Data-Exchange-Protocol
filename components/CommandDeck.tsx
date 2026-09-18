'use client';

import React, { useState } from 'react';
import { Check, Copy, Database, FileText, Layers, LockKeyhole, ShieldCheck } from 'lucide-react';
import { AuditLedger } from './AuditLedger';
import { CryptographicLab } from './CryptographicLab';
import type { VerificationLogItem } from '@/app/api/v1/exchange/verify/route';
import { USE_CASES, type UseCaseConfig } from './UseCaseSelector';

interface CommandDeckProps {
  logs: VerificationLogItem[];
  onRefreshLogs: () => void;
  isLoadingLogs: boolean;
  activeUseCase: UseCaseConfig;
  onSelectUseCase: (uc: UseCaseConfig) => void;
  onOpenPitch: () => void;
  onOpenSchema: () => void;
}

type EvidenceTab = 'ledger' | 'proofs' | 'exchange' | 'protection' | 'briefing';

const tabs: { id: EvidenceTab; label: string; icon: typeof ShieldCheck }[] = [
  { id: 'ledger', label: 'Audit ledger', icon: ShieldCheck },
  { id: 'proofs', label: 'Proof verification', icon: LockKeyhole },
  { id: 'exchange', label: 'Exchange matrix', icon: Layers },
  { id: 'protection', label: 'Data protection', icon: Database },
  { id: 'briefing', label: 'Executive briefing', icon: FileText },
];

export function CommandDeck({
  logs,
  onRefreshLogs,
  isLoadingLogs,
  activeUseCase,
  onSelectUseCase,
  onOpenPitch,
  onOpenSchema,
}: CommandDeckProps) {
  const [activeTab, setActiveTab] = useState<EvidenceTab>('ledger');

  return (
    <section id="sdep-command-deck" className="overflow-hidden rounded-2xl border border-[var(--sdep-border)] bg-[rgba(12,23,32,0.84)] shadow-xl shadow-black/10">
      <div className="border-b border-[var(--sdep-border)] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="mt-1 text-xl font-semibold text-[var(--sdep-text)]">Inspect the exchange</h2></div>
          <span className="rounded-full border border-[rgba(112,214,167,0.3)] bg-[rgba(112,214,167,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[var(--sdep-success)]">SDEP-ZKP v2 active</span>
        </div>
        <div role="tablist" aria-label="Evidence views" className="mt-4 flex gap-1 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeTab;
            return <button key={id} type="button" role="tab" aria-selected={isActive} aria-controls={`evidence-panel-${id}`} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${isActive ? 'bg-[var(--sdep-teal)] text-[#061018]' : 'text-[var(--sdep-text-muted)] hover:bg-[var(--sdep-surface)] hover:text-[var(--sdep-text)]'}`}><Icon className="h-3.5 w-3.5" />{label}{id === 'ledger' && <span className="opacity-70">({logs.length})</span>}</button>;
          })}
        </div>
      </div>

      <div id={`evidence-panel-${activeTab}`} role="tabpanel" className="p-4 sm:p-6">
        {activeTab === 'ledger' && <AuditLedger logs={logs} onRefresh={onRefreshLogs} isLoading={isLoadingLogs} />}
        {activeTab === 'proofs' && <CryptographicLab logs={logs} />}
        {activeTab === 'exchange' && <ExchangeMatrix activeUseCase={activeUseCase} onSelectUseCase={onSelectUseCase} />}
        {activeTab === 'protection' && <ProtectionPanel onOpenSchema={onOpenSchema} />}
        {activeTab === 'briefing' && <BriefingPanel onOpenPitch={onOpenPitch} />}
      </div>
    </section>
  );
}

function ExchangeMatrix({ activeUseCase, onSelectUseCase }: { activeUseCase: UseCaseConfig; onSelectUseCase: (uc: UseCaseConfig) => void }) {
  return <div className="space-y-4"><div><h3 className="text-base font-semibold text-[var(--sdep-text)]">Inter-ministerial exchange matrix</h3></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{USE_CASES.map((useCase) => { const selected = useCase.id === activeUseCase.id; const Icon = useCase.icon; return <button key={useCase.id} type="button" onClick={() => onSelectUseCase(useCase)} className={`rounded-xl border p-4 text-left transition ${selected ? 'border-[var(--sdep-teal)] bg-[rgba(26,168,145,0.12)]' : 'border-[var(--sdep-border)] bg-[rgba(7,16,24,0.44)] hover:border-[var(--sdep-border-strong)]'}`}><div className="flex items-start justify-between"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sdep-surface-raised)] text-[var(--sdep-teal)]"><Icon className="h-4 w-4" /></span>{selected && <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sdep-teal)]">Active</span>}</div><h4 className="mt-3 text-sm font-semibold text-[var(--sdep-text)]">{useCase.name}</h4><p className="mt-1 text-xs text-[var(--sdep-text-muted)]">{useCase.requestingShort} <span className="mx-1 text-[var(--sdep-teal)]">to</span> {useCase.targetShort}</p></button>; })}</div></div>;
}

function ProtectionPanel({ onOpenSchema }: { onOpenSchema: () => void }) {
  const [copied, setCopied] = useState(false);
  const publicWrapperSql = `CREATE OR REPLACE FUNCTION public.verify_275_means_test(
  p_citizen_id VARCHAR(50),
  p_kra_pin VARCHAR(20),
  p_declared_household_income DECIMAL(12, 2),
  p_mti_proxy_score INTEGER,
  p_req_purpose VARCHAR(50)
)
RETURNS TABLE (
  risk_assessment VARCHAR(30),
  cryptographic_signature VARCHAR(66),
  data_exposed_bytes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, kra_vault, sovereign_audit, pg_temp
AS $$
BEGIN
  -- Evaluate protected fields inside the custodian vault.
  RETURN QUERY SELECT * FROM kra_vault.verify_275_means_test(
    p_citizen_id, p_kra_pin, p_declared_household_income,
    p_mti_proxy_score, p_req_purpose
  );
END;
$$;`;
  const rows = [['Protected identity', 'SHA-256 digest', 'Internal lookup'], ['Citizen profile', 'Private record', 'No direct SELECT'], ['Income and tax data', 'Sensitive fields', 'Evaluated in memory'], ['Returned value', 'Boolean proof', 'Signed response']];
  const copySql = async () => {
    await navigator.clipboard.writeText(publicWrapperSql);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return <div className="space-y-4"><div><h3 className="text-base font-semibold text-[var(--sdep-text)]">Data protection controls</h3></div><div className="overflow-hidden rounded-xl border border-[var(--sdep-border)]"><div className="grid grid-cols-3 gap-3 bg-[var(--sdep-surface)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--sdep-text-subtle)]"><span>Data element</span><span>Handling</span><span>External access</span></div>{rows.map(([name, handling, access]) => <div key={name} className="grid grid-cols-3 gap-3 border-t border-[var(--sdep-border)] px-3 py-3 text-xs"><span className="font-semibold text-[var(--sdep-text)]">{name}</span><span className="text-[var(--sdep-text-muted)]">{handling}</span><span className="text-[var(--sdep-success)]">{access}</span></div>)}</div><div className="rounded-xl border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold text-[var(--sdep-text)]">Public RPC wrapper</p></div><button type="button" onClick={copySql} className="flex items-center gap-1.5 rounded-lg border border-[var(--sdep-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--sdep-blue)]">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy SQL'}</button></div><pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-[var(--sdep-border)] bg-[#050c12] p-3 font-mono text-[10px] leading-relaxed text-[var(--sdep-blue)]">{publicWrapperSql}</pre></div><button type="button" onClick={onOpenSchema} className="rounded-lg border border-[var(--sdep-border)] bg-[var(--sdep-surface)] px-3 py-2 text-xs font-semibold text-[var(--sdep-text-muted)] hover:border-[var(--sdep-border-strong)] hover:text-[var(--sdep-text)]">Open complete migration and RLS policy</button></div>;
}

function BriefingPanel({ onOpenPitch }: { onOpenPitch: () => void }) {
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start"><div><h3 className="text-2xl font-semibold text-[var(--sdep-text)]">Verification without exposure.</h3><div className="mt-5 grid gap-2 sm:grid-cols-3"><div className="rounded-xl border border-[var(--sdep-border)] bg-[rgba(7,16,24,0.44)] p-3"><strong className="text-sm text-[var(--sdep-success)]">0 bytes</strong><p className="mt-1 text-xs text-[var(--sdep-text-muted)]">Protected records exposed</p></div><div className="rounded-xl border border-[var(--sdep-border)] bg-[rgba(7,16,24,0.44)] p-3"><strong className="text-sm text-[var(--sdep-blue)]">Signed</strong><p className="mt-1 text-xs text-[var(--sdep-text-muted)]">Proof returned with every answer</p></div><div className="rounded-xl border border-[var(--sdep-border)] bg-[rgba(7,16,24,0.44)] p-3"><strong className="text-sm text-[var(--sdep-warning)]">Audited</strong><p className="mt-1 text-xs text-[var(--sdep-text-muted)]">Exchange recorded for review</p></div></div></div><button type="button" onClick={onOpenPitch} className="rounded-lg bg-[var(--sdep-teal)] px-4 py-2.5 text-xs font-semibold text-[#061018] hover:bg-[#82e4d3]">Open full briefing</button></div></div>;
}