'use client';

import React from 'react';
import { CheckCircle2, ShieldAlert, ShieldCheck, X, XCircle } from 'lucide-react';

export interface ProofVerificationData {
  valid: boolean;
  message?: string;
  verificationDetails?: {
    proofHash: string;
    requestingMinistry: string;
    originatingMinistry: string;
    verdict: string;
    dataExposedBytes?: number;
    chainContinuity?: string;
    cryptographicAlgorithm?: string;
  };
}

interface ProofVerificationDialogProps {
  data: ProofVerificationData | null;
  onClose: () => void;
  idPrefix?: string;
}

export function ProofVerificationDialog({ data, onClose, idPrefix = 'proof' }: ProofVerificationDialogProps) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby={`${idPrefix}-dialog-title`} className="w-full max-w-xl rounded-2xl border border-[var(--sdep-border-strong)] bg-[var(--sdep-surface)] p-5 text-[var(--sdep-text)] shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--sdep-border)] pb-4">
          <div className="flex items-center gap-3">
            {data.valid ? <ShieldCheck className="h-5 w-5 text-[var(--sdep-success)]" /> : <ShieldAlert className="h-5 w-5 text-[var(--sdep-danger)]" />}
            <div>
              <h2 id={`${idPrefix}-dialog-title`} className="text-sm font-semibold">{data.valid ? 'Proof verified' : 'Proof could not be verified'}</h2>
              <p className="mt-1 text-xs text-[var(--sdep-text-muted)]">{data.valid ? 'The signature matches the recorded audit evidence.' : data.message || 'The signature is invalid or may have been changed.'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close proof verification" className="rounded-lg p-1 text-[var(--sdep-text-muted)] hover:bg-[var(--sdep-surface-raised)] hover:text-[var(--sdep-text)]"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-3 text-xs">
          <div className={`flex items-center gap-3 rounded-xl border p-3 ${data.valid ? 'border-[rgba(112,214,167,0.45)] bg-[rgba(112,214,167,0.1)]' : 'border-[rgba(240,131,131,0.45)] bg-[rgba(240,131,131,0.1)]'}`}>
            {data.valid ? <CheckCircle2 className="h-5 w-5 text-[var(--sdep-success)]" /> : <XCircle className="h-5 w-5 text-[var(--sdep-danger)]" />}
            <span className="font-semibold">{data.valid ? 'Authentic signed zero-knowledge proof' : 'Cryptographic validation anomaly'}</span>
          </div>

          {data.verificationDetails && <>
            <div className="rounded-xl border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-3">
              <span className="text-[10px] uppercase tracking-wider text-[var(--sdep-text-subtle)]">Proof hash</span>
              <p className="mt-1 break-all font-mono text-xs text-[var(--sdep-blue)]">{data.verificationDetails.proofHash}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-3"><span className="text-[10px] uppercase tracking-wider text-[var(--sdep-text-subtle)]">Channel</span><p className="mt-1 text-[var(--sdep-text)]">{data.verificationDetails.requestingMinistry} <span className="text-[var(--sdep-teal)]">to</span> {data.verificationDetails.originatingMinistry}</p></div>
              <div className="rounded-xl border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-3"><span className="text-[10px] uppercase tracking-wider text-[var(--sdep-text-subtle)]">Verdict</span><p className="mt-1 font-semibold text-[var(--sdep-success)]">{data.verificationDetails.verdict}</p></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-3"><span className="text-[10px] uppercase tracking-wider text-[var(--sdep-text-subtle)]">Data exposed</span><p className="mt-1 font-semibold text-[var(--sdep-success)]">{data.verificationDetails.dataExposedBytes ?? 0} bytes</p></div>
              <div className="rounded-xl border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-3"><span className="text-[10px] uppercase tracking-wider text-[var(--sdep-text-subtle)]">Chain</span><p className="mt-1 font-semibold text-[var(--sdep-teal)]">{data.verificationDetails.chainContinuity || 'Verified'}</p></div>
              <div className="rounded-xl border border-[var(--sdep-border)] bg-[var(--sdep-ink)] p-3"><span className="text-[10px] uppercase tracking-wider text-[var(--sdep-text-subtle)]">Algorithm</span><p className="mt-1 text-[var(--sdep-text)]">{data.verificationDetails.cryptographicAlgorithm || 'HMAC-SHA256'}</p></div>
            </div>
          </>}
        </div>

        <div className="mt-5 flex justify-end border-t border-[var(--sdep-border)] pt-4"><button type="button" onClick={onClose} className="rounded-lg bg-[var(--sdep-surface-raised)] px-3 py-2 text-xs font-semibold text-[var(--sdep-text)] hover:bg-[var(--sdep-border)]">Close</button></div>
      </div>
    </div>
  );
}
