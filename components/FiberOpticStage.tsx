'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Database,
  EyeOff,
  FileCheck2,
  KeyRound,
  Lock,
  Play,
  ShieldCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import type { UseCaseConfig } from './UseCaseSelector';
import { UseCaseSelector } from './UseCaseSelector';
import type { VerificationResult } from './NodeCanvas';

interface FiberOpticStageProps {
  useCase: UseCaseConfig;
  allUseCases: UseCaseConfig[];
  onSelectUseCase: (uc: UseCaseConfig) => void;
  nationalId: string;
  onChangeNationalId: (val: string) => void;
  kraPin?: string;
  onChangeKraPin?: (val: string) => void;
  declaredIncome?: number;
  onChangeDeclaredIncome?: (val: number) => void;
  mtiScore?: number;
  onChangeMtiScore?: (val: number) => void;
  reqPurpose?: 'VERIFY_INDIGENT_STATUS' | 'VALIDATE_CONTRIBUTION_BASE';
  onChangeReqPurpose?: (val: 'VERIFY_INDIGENT_STATUS' | 'VALIDATE_CONTRIBUTION_BASE') => void;
  thresholdIncome: number;
  onChangeThresholdIncome: (val: number) => void;
  isExecuting: boolean;
  currentStep: number;
  onExecute: () => void;
  lastResult: VerificationResult | null;
  errorMessage: string | null;
  onVerifyProof: (proofHash: string) => void;
}

const stages = [
  ['Protect identifier', 'Local SHA-256 digest', KeyRound],
  ['Dispatch request', 'Purpose-limited RPC', Zap],
  ['Evaluate in vault', 'Private predicate only', Database],
  ['Sign response', 'HMAC proof generated', ShieldCheck],
  ['Record evidence', 'Audit chain updated', Clipboard],
] as const;

export function FiberOpticStage({
  useCase,
  allUseCases,
  onSelectUseCase,
  nationalId,
  onChangeNationalId,
  kraPin = 'A009123847K',
  onChangeKraPin,
  declaredIncome = 0,
  onChangeDeclaredIncome,
  mtiScore = 15,
  onChangeMtiScore,
  reqPurpose = 'VERIFY_INDIGENT_STATUS',
  onChangeReqPurpose,
  thresholdIncome,
  onChangeThresholdIncome,
  isExecuting,
  currentStep,
  onExecute,
  lastResult,
  errorMessage,
  onVerifyProof,
}: FiberOpticStageProps) {
  const [hasConsent, setHasConsent] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const isMeansTest = useCase.id === 'shif-kra-275';
  const status = isExecuting ? 'In progress' : lastResult ? 'Decision recorded' : 'Ready';

  const copyProof = async () => {
    if (!lastResult?.proofHash) return;
    await navigator.clipboard.writeText(lastResult.proofHash);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="cinematic-fiber-optic-stage" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--sdep-border)] pb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--sdep-text)] sm:text-3xl">Sovereign verification desk</h2>
        </div>
      </div>

      <UseCaseSelector activeUseCaseId={useCase.id} onSelectUseCase={onSelectUseCase} />

      <div className="overflow-hidden rounded-xl border border-[var(--sdep-border)] bg-[rgba(15,23,42,0.86)] shadow-2xl shadow-black/20">
        <div className="border-b border-[var(--sdep-border)] bg-[rgba(30,41,59,0.48)] px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--sdep-text-subtle)]">Simulation route</p></div><div className="flex items-center gap-2 text-xs text-[var(--sdep-text-muted)]"><span className={`h-2 w-2 rounded-full ${isExecuting ? 'animate-pulse bg-[var(--sdep-warning)]' : 'bg-[var(--sdep-success)]'}`} /></div></div>
          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
            <RouteCard label="Requesting authority" title={useCase.requestingMinistry} tone="blue" />
            <RouteArrow />
            <RouteCard label="Protected source authority" title={useCase.targetVault} tone="teal" />
            <RouteArrow />
            <RouteCard label="Returned to requester" title="Signed decision + proof" tone="green" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(210px,0.6fr)_minmax(0,1.05fr)]">
          <form onSubmit={(event) => { event.preventDefault(); onExecute(); }} className="space-y-4 border-b border-[var(--sdep-border)] p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <PanelHeading eyebrow="01 · Requesting terminal" title={useCase.requestingShort} icon={KeyRound} tone="blue" />
            <div><label htmlFor="input-stage-national-id" className="flex items-center justify-between text-xs font-semibold text-[var(--sdep-text)]"><span>Citizen reference</span></label><input id="input-stage-national-id" type="text" value={nationalId} onChange={(event) => onChangeNationalId(event.target.value)} placeholder="Enter national ID" className="mt-1.5 w-full rounded-lg border border-[var(--sdep-border)] bg-[var(--sdep-ink)] px-3 py-2.5 text-sm text-[var(--sdep-text)] placeholder:text-[var(--sdep-text-subtle)]" /><div className="mt-2 flex flex-wrap gap-1.5">{useCase.suggestedIds.map((profile) => <button key={profile.id} type="button" onClick={() => onChangeNationalId(profile.id)} className={`rounded-full border px-2.5 py-1 text-[11px] ${nationalId === profile.id ? 'border-[var(--sdep-teal)] bg-[rgba(26,168,145,0.16)] text-[var(--sdep-teal)]' : 'border-[var(--sdep-border)] text-[var(--sdep-text-muted)] hover:border-[var(--sdep-border-strong)]'}`}>{profile.label}</button>)}</div></div>

            {isMeansTest && <div className="space-y-3 rounded-xl border border-[var(--sdep-border)] bg-[rgba(11,17,32,0.66)] p-3"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-[var(--sdep-text)]">Scenario parameters</p></div></div><label className="block text-xs text-[var(--sdep-text-muted)]">KRA PIN<input type="text" value={kraPin} onChange={(event) => onChangeKraPin?.(event.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-[var(--sdep-border)] bg-[var(--sdep-ink)] px-3 py-2 text-sm text-[var(--sdep-text)]" /></label><div><div className="flex justify-between text-xs text-[var(--sdep-text-muted)]"><span>Declared household income</span><strong className="text-[var(--sdep-warning)]">KES {declaredIncome.toLocaleString()}</strong></div><div className="mt-2 grid grid-cols-3 gap-1.5">{[0, 15000, 42000].map((value) => <button key={value} type="button" onClick={() => onChangeDeclaredIncome?.(value)} className={`rounded-lg border py-1.5 text-[10px] ${declaredIncome === value ? 'border-[var(--sdep-warning)] text-[var(--sdep-warning)]' : 'border-[var(--sdep-border)] text-[var(--sdep-text-muted)]'}`}>{value === 0 ? 'Indigent' : `${value / 1000}k`}</button>)}</div></div><label className="block text-xs text-[var(--sdep-text-muted)]">MTI proxy score <span className="float-right font-semibold text-[var(--sdep-text)]">{mtiScore}</span><input type="range" min="1" max="100" value={mtiScore} onChange={(event) => onChangeMtiScore?.(Number(event.target.value))} className="mt-2 w-full accent-[var(--sdep-teal)]" /></label><div className="flex flex-wrap gap-1.5 text-[10px]"><button type="button" onClick={() => onChangeReqPurpose?.('VERIFY_INDIGENT_STATUS')} className={`rounded-full border px-2 py-1 ${reqPurpose === 'VERIFY_INDIGENT_STATUS' ? 'border-[var(--sdep-teal)] text-[var(--sdep-teal)]' : 'border-[var(--sdep-border)] text-[var(--sdep-text-muted)]'}`}>Indigent status</button><button type="button" onClick={() => onChangeReqPurpose?.('VALIDATE_CONTRIBUTION_BASE')} className={`rounded-full border px-2 py-1 ${reqPurpose === 'VALIDATE_CONTRIBUTION_BASE' ? 'border-[var(--sdep-teal)] text-[var(--sdep-teal)]' : 'border-[var(--sdep-border)] text-[var(--sdep-text-muted)]'}`}>Contribution base</button></div></div>}

            {thresholdIncome > 0 && <label className="block text-xs text-[var(--sdep-text-muted)]">{useCase.predicateLabel}<span className="float-right font-semibold text-[var(--sdep-blue)]">KES {thresholdIncome.toLocaleString()}</span><input type="range" min="10000" max="150000" step="5000" value={thresholdIncome} onChange={(event) => onChangeThresholdIncome(Number(event.target.value))} className="mt-2 w-full accent-[var(--sdep-teal)]" /></label>}
            <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--sdep-border)] bg-[rgba(30,41,59,0.55)] p-3"><div className="flex items-center gap-2"><FileCheck2 className={`h-4 w-4 ${hasConsent ? 'text-[var(--sdep-success)]' : 'text-[var(--sdep-danger)]'}`} /><div><p className="text-xs font-semibold text-[var(--sdep-text)]">Consent token</p></div></div><button type="button" onClick={() => setHasConsent((value) => !value)} className={`rounded-full px-2 py-1 text-[10px] font-semibold ${hasConsent ? 'text-[var(--sdep-success)]' : 'text-[var(--sdep-danger)]'}`}>{hasConsent ? 'Attached' : 'Missing'}</button></div>
            <button id="btn-stage-dispatch-query" type="submit" disabled={isExecuting || !nationalId.trim() || !hasConsent} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--sdep-teal)] px-4 py-3 text-sm font-semibold text-[#f8fafc] hover:bg-[#7dd3fc] disabled:cursor-not-allowed disabled:bg-[var(--sdep-surface-raised)] disabled:text-[var(--sdep-text-subtle)]"><Play className="h-4 w-4 fill-current" />{isExecuting ? 'Verification in progress' : 'Dispatch verification request'}</button>
          </form>

          <div className="relative border-b border-[var(--sdep-border)] bg-[rgba(11,17,32,0.46)] p-4 sm:p-6 lg:border-b-0 lg:border-r"><PanelHeading eyebrow="02 · Exchange corridor" title="SDEP proof engine" icon={Zap} tone="teal" /><div className="my-5 hidden justify-center lg:flex"><div className="relative flex h-64 w-20 flex-col items-center justify-between"><div className="absolute top-3 bottom-3 w-px bg-[var(--sdep-border-strong)]" />{stages.map(([label, detail, Icon], index) => { const step = index + 1; const active = isExecuting && currentStep === step; const done = currentStep > step || (!isExecuting && lastResult !== null); return <div key={label} className="relative z-10 flex w-full flex-col items-center gap-1"><span className={`flex h-9 w-9 items-center justify-center rounded-full border ${active ? 'border-[var(--sdep-teal)] bg-[var(--sdep-teal)] text-[#f8fafc]' : done ? 'border-[var(--sdep-success)] bg-[rgba(16,185,129,0.14)] text-[var(--sdep-success)]' : 'border-[var(--sdep-border-strong)] bg-[var(--sdep-ink)] text-[var(--sdep-text-subtle)]'}`}>{active ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Icon className="h-4 w-4" /></motion.span> : done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span><span className="text-center text-[9px] font-semibold leading-tight text-[var(--sdep-text)]">{label}</span></div>; })}</div></div><div className="space-y-2 lg:hidden">{stages.map(([label, detail, Icon], index) => <div key={label} className="flex items-center gap-2 rounded-lg border border-[var(--sdep-border)] p-2"><Icon className="h-4 w-4 text-[var(--sdep-teal)]" /><div><p className="text-[11px] font-semibold text-[var(--sdep-text)]">{index + 1}. {label}</p><p className="text-[10px] text-[var(--sdep-text-muted)]">{detail}</p></div></div>)}</div></div>

          <div className="space-y-4 p-4 sm:p-6"><PanelHeading eyebrow="03 · Protected destination" title={useCase.targetShort} icon={Database} tone="green" /><div className="space-y-2 rounded-xl border border-[var(--sdep-border)] bg-[rgba(11,17,32,0.6)] p-3 text-xs"><div className="flex justify-between"><span className="text-[var(--sdep-text-muted)]">Vault status</span><span className="font-semibold text-[var(--sdep-success)]">RLS enforced</span></div><div className="flex justify-between"><span className="text-[var(--sdep-text-muted)]">Raw field access</span><span className="font-semibold text-[var(--sdep-warning)]">Forbidden</span></div><div className="flex justify-between"><span className="text-[var(--sdep-text-muted)]">External response</span><span className="font-semibold text-[var(--sdep-teal)]">Proof only</span></div></div>{errorMessage && <div role="alert" className="flex gap-2 rounded-lg border border-[rgba(239,68,68,0.45)] bg-[rgba(239,68,68,0.1)] p-3 text-xs text-[var(--sdep-danger)]"><AlertTriangle className="h-4 w-4 shrink-0" />{errorMessage}</div>}{!lastResult && !errorMessage && <div className="rounded-xl border border-dashed border-[var(--sdep-border-strong)] p-5 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-[var(--sdep-text-subtle)]" /><p className="mt-2 text-sm font-semibold text-[var(--sdep-text)]">Awaiting signed decision</p><p className="mt-1 text-[11px] text-[var(--sdep-text-muted)]">The source authority will return only the answer required by the request.</p></div>}{lastResult && <div aria-live="polite" className={`rounded-xl border p-3 ${lastResult.risk_assessment === 'FLAG_FRAUD' ? 'border-[rgba(239,68,68,0.55)] bg-[rgba(239,68,68,0.1)]' : lastResult.risk_assessment === 'FLAG_ASSET_MISMATCH' ? 'border-[rgba(245,158,11,0.55)] bg-[rgba(245,158,11,0.1)]' : 'border-[rgba(16,185,129,0.5)] bg-[rgba(16,185,129,0.1)]'}`}><div className="flex items-start gap-2">{lastResult.eligible ? <CheckCircle2 className="h-5 w-5 text-[var(--sdep-success)]" /> : <XCircle className="h-5 w-5 text-[var(--sdep-warning)]" />}<div><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sdep-text-muted)]">Signed decision</p><p className="mt-1 text-base font-semibold text-[var(--sdep-text)]">{lastResult.risk_label || (lastResult.eligible ? 'Eligible' : 'Review required')}</p><p className="mt-1 text-[11px] leading-relaxed text-[var(--sdep-text-muted)]">{lastResult.risk_description || (lastResult.taxCompliant ? 'Criteria met.' : 'Criteria not met.')}</p></div></div>{lastResult.recommended_action && <p className="mt-3 border-t border-[var(--sdep-border)] pt-3 text-[11px] text-[var(--sdep-text-muted)]"><strong className="text-[var(--sdep-text)]">Action:</strong> {lastResult.recommended_action}</p>}<div className="mt-3 border-t border-[var(--sdep-border)] pt-3"><p className="text-[10px] uppercase tracking-wider text-[var(--sdep-text-subtle)]">Proof signature</p><p className="mt-1 break-all font-mono text-[10px] text-[var(--sdep-blue)]">{lastResult.proofHash}</p><div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => setShowJson((value) => !value)} className="rounded border border-[var(--sdep-border)] px-2 py-1 text-[10px] font-semibold text-[var(--sdep-text-muted)]">{showJson ? 'Hide JSON' : 'View JSON'}</button><button type="button" onClick={() => onVerifyProof(lastResult.proofHash)} className="rounded border border-[var(--sdep-border)] px-2 py-1 text-[10px] font-semibold text-[var(--sdep-success)]">Verify proof</button><button type="button" onClick={copyProof} className="flex items-center gap-1 rounded border border-[var(--sdep-border)] px-2 py-1 text-[10px] font-semibold text-[var(--sdep-text-muted)]">{copied ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}{copied ? 'Copied' : 'Copy proof'}</button></div></div>{showJson && <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-2 font-mono text-[9px] leading-relaxed text-[var(--sdep-blue)]">{JSON.stringify(lastResult, null, 2)}</pre>}</div>}</div>
        </div>
      </div>
    </section>
  );
}

function PanelHeading({ eyebrow, title, icon: Icon, tone }: { eyebrow: string; title: string; icon: React.ComponentType<{ className?: string }>; tone: 'blue' | 'teal' | 'green' }) {
  const color = tone === 'blue' ? 'text-[var(--sdep-blue)]' : tone === 'green' ? 'text-[var(--sdep-success)]' : 'text-[var(--sdep-teal)]';
  return <div className="flex items-start gap-3 border-b border-[var(--sdep-border)] pb-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sdep-surface-raised)] ${color}`}><Icon className="h-4 w-4" /></span><div><p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${color}`}>{eyebrow}</p><h3 className="mt-1 text-sm font-semibold text-[var(--sdep-text)]">{title}</h3></div></div>;
}

function RouteCard({ label, title, detail, tone }: { label: string; title: string; detail?: string; tone: 'blue' | 'teal' | 'green' }) {
  const color = tone === 'blue' ? 'text-[var(--sdep-blue)]' : tone === 'green' ? 'text-[var(--sdep-success)]' : 'text-[var(--sdep-teal)]';
  return <div className="rounded-lg border border-[var(--sdep-border)] bg-[rgba(11,17,32,0.72)] p-3"><p className={`text-[10px] font-semibold uppercase tracking-wider ${color}`}>{label}</p><p className="mt-2 text-sm font-semibold text-[var(--sdep-text)]">{title}</p>{detail && <p className="mt-1 text-[11px] text-[var(--sdep-text-muted)]">{detail}</p>}</div>;
}

function RouteArrow() {
  return <div className="hidden items-center justify-center text-[var(--sdep-teal)] md:flex"><ArrowRight className="h-5 w-5" /></div>;
}