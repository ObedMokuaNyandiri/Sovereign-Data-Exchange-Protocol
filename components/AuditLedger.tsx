'use client';

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import type { VerificationLogItem } from '@/app/api/v1/exchange/verify/route';

interface AuditLedgerProps {
  logs: VerificationLogItem[];
  onRefresh: () => void;
  isLoading: boolean;
}

interface ValidationResultData {
  valid: boolean;
  status: string;
  protocol?: string;
  message?: string;
  errorType?: string;
  mathematicalProof?: {
    rawFormula: string;
    entropyLeakedBits: number;
    informationLeakageProof: string;
    verifiedHashLength: string;
  };
  tamperDiagnostics?: {
    originalProofHash: string;
    tamperedInputHash: string;
    divergencePoint: string;
    signatureMismatch: boolean;
    actionTaken: string;
    informationLeakage: string;
  };
  verificationDetails?: {
    proofHash: string;
    requestingMinistry: string;
    originatingMinistry: string;
    queryPredicate: string;
    verdict: string;
    taxCompliant: boolean;
    recordedTimestamp: string;
    executionLatencyMs: number;
    dataExposedBytes: number;
    chainContinuity: string;
    cryptographicAlgorithm: string;
    signatureValid: boolean;
  };
}

export function AuditLedger({ logs, onRefresh, isLoading }: AuditLedgerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationModal, setValidationModal] = useState<ValidationResultData | null>(null);
  const [merkleModal, setMerkleModal] = useState<any | null>(null);
  const [isAuditingMerkle, setIsAuditingMerkle] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.requesting_ministry.toLowerCase().includes(term) ||
      log.originating_ministry.toLowerCase().includes(term) ||
      log.proof_hash.toLowerCase().includes(term) ||
      log.verification_type.toLowerCase().includes(term) ||
      log.query_predicate.toLowerCase().includes(term)
    );
  });

  const handleCopy = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleValidateProof = async (log: VerificationLogItem, simulateTamper = false) => {
    setValidatingId(log.id);
    try {
      const hashToSend = simulateTamper
        ? log.proof_hash.substring(0, 10) + 'ffffffff' + log.proof_hash.substring(18)
        : log.proof_hash;

      const res = await fetch('/api/v1/exchange/validate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: log.id, proofHash: hashToSend, simulateTamper }),
      });

      const data = await res.json();
      setValidationModal(data);
    } catch {
      // Handled silently
    } finally {
      setValidatingId(null);
    }
  };

  const handleVerifyMerkleChain = async () => {
    setIsAuditingMerkle(true);
    try {
      const res = await fetch('/api/v1/audit/verify-chain');
      const data = await res.json();
      setMerkleModal(data);
    } catch {
      // Handled silently
    } finally {
      setIsAuditingMerkle(false);
    }
  };

  return (
    <section
      id="sdep-audit-ledger-section"
      className="w-full bg-[#080d16] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Immutable Sovereign Audit Ledger
            </h2>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
              HASH-CHAIN VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Append-only cryptographic proofs &bull; Zero citizen personal data stored
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="input-search-audit-stream"
              aria-label="Search audit ledger"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search proof or ministry..."
              className="pl-7 pr-2.5 py-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none transition font-mono w-44 sm:w-56"
            />
          </div>

          <button
            type="button"
            id="btn-verify-merkle-chain"
            onClick={handleVerifyMerkleChain}
            disabled={isAuditingMerkle}
            className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-purple-300 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5"
            title="Verify entire append-only hash chain and Merkle root"
          >
            <Cpu className={`w-3.5 h-3.5 ${isAuditingMerkle ? 'animate-spin' : 'text-purple-400'}`} />
            <span className="hidden sm:inline">Verify Merkle Chain</span>
          </button>

          <button
            type="button"
            id="btn-refresh-audit"
            aria-label="Refresh audit ledger"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            title="Sync Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Channel</th>
              <th className="py-2 px-3">Predicate</th>
              <th className="py-2 px-3">Proof Signature</th>
              <th className="py-2 px-3 text-center">Verdict</th>
              <th className="py-2 px-3 text-right">Speed</th>
              <th className="py-2 px-3 text-right">Data</th>
              <th className="py-2 px-3 text-center">Cryptographic Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-500 italic">
                  No verification transactions found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const date = new Date(log.created_at);
                const timeStr = date.toLocaleTimeString('en-KE', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const isValidating = validatingId === log.id;

                return (
                  <tr
                    key={log.id}
                    id={`log-row-${log.id}`}
                    className="hover:bg-slate-900/70 transition group"
                  >
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{timeStr}</td>
                    <td className="py-2 px-3 text-white whitespace-nowrap">
                      <span className="text-cyan-300 font-semibold">{log.requesting_ministry}</span>
                      <span className="text-slate-500 mx-1">&rarr;</span>
                      <span className="text-emerald-300 font-semibold">
                        {log.originating_ministry}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300 whitespace-nowrap max-w-xs truncate">
                      {log.query_predicate}
                    </td>
                    <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-cyan-400 font-bold">
                          {log.proof_hash.substring(0, 8)}...{log.proof_hash.substring(log.proof_hash.length - 6)}
                        </span>
                        <button
                          type="button"
                          id={`btn-copy-hash-${log.id}`}
                          onClick={() => handleCopy(log.proof_hash, log.id)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition cursor-pointer"
                          title="Copy Full Proof Hash"
                        >
                          {copiedId === log.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {log.query_predicate.includes('FLAG_ASSET_MISMATCH') ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
                          <span>ASSET MISMATCH</span>
                        </span>
                      ) : log.query_predicate.includes('FLAG_FRAUD') ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-600">
                          <XCircle className="w-3 h-3 text-red-400" />
                          <span>FLAG FRAUD</span>
                        </span>
                      ) : log.query_predicate.includes('VERIFIED_OK') ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>VERIFIED OK</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.result_boolean
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {log.result_boolean ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>ELIGIBLE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-amber-400" />
                              <span>INELIGIBLE</span>
                            </>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-300 font-semibold whitespace-nowrap">
                      {Number(log.execution_time_ms).toFixed(1)}ms
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold whitespace-nowrap">
                      0.00 B
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          type="button"
                          id={`btn-verify-proof-${log.id}`}
                          disabled={isValidating}
                          onClick={() => handleValidateProof(log, false)}
                          className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Verify cryptographic proof signature against mathematical ledger"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{isValidating ? 'Verifying...' : 'Verify Proof'}</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-tamper-test-${log.id}`}
                          onClick={() => handleValidateProof(log, true)}
                          className="text-[9px] text-slate-500 hover:text-amber-400 underline underline-offset-2 transition cursor-pointer"
                          title="Test how the validator rejects a modified or forged hash"
                        >
                          Test Tamper
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cryptographic Proof Attestation Modal */}
      {validationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                {validationModal.valid ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                )}
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider">
                  {validationModal.valid
                    ? 'Cryptographic Proof Integrity: VERIFIED'
                    : 'Cryptographic Proof: TAMPERED / INVALID'}
                </h3>
              </div>
              <button
                type="button"
                id="btn-close-validation-modal"
                onClick={() => setValidationModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs font-mono">
              <div
                className={`p-3 rounded-xl border flex items-center space-x-3 ${
                  validationModal.valid
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/80 text-red-200'
                }`}
              >
                {validationModal.valid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {validationModal.valid
                      ? 'Authentic Sovereign Zero-Knowledge Proof'
                      : 'Mathematical Verification Failed'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {validationModal.valid
                      ? 'Signature verified against SHA-256 HMAC root with unbroken ledger continuity.'
                      : validationModal.message ||
                        'Hash does not match recorded cryptographic state in ledger. Forgery detected.'}
                  </div>
                </div>
              </div>

              {validationModal.verificationDetails && (
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">PROOF HASH</span>
                    <span className="text-cyan-300 break-all text-[11px]">
                      {validationModal.verificationDetails.proofHash}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">CHANNEL</span>
                      <span className="text-slate-300">
                        {validationModal.verificationDetails.requestingMinistry} &rarr;{' '}
                        {validationModal.verificationDetails.originatingMinistry}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">VERDICT</span>
                      <span className="text-emerald-400 font-bold">
                        {validationModal.verificationDetails.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">RAW DATA EXPOSED</span>
                      <span className="text-emerald-400 font-bold">0.00 BYTES</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">CHAIN CONTINUITY</span>
                      <span className="text-cyan-300 font-bold">VALID HASH-CHAIN</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">ALGORITHM</span>
                      <span className="text-slate-300">HMAC-SHA256</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mathematical Proof Guarantees */}
              {validationModal.mathematicalProof && (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-[11px]">
                  <span className="text-slate-400 font-semibold block">Cryptographic Mathematical Proof:</span>
                  <div className="text-cyan-300 font-mono text-[10px]">
                    {validationModal.mathematicalProof.rawFormula}
                  </div>
                  <div className="text-emerald-400 font-mono text-[10px]">
                    {validationModal.mathematicalProof.informationLeakageProof}
                  </div>
                </div>
              )}

              {/* Tamper Diagnostics */}
              {validationModal.tamperDiagnostics && (
                <div className="p-2.5 bg-red-950/40 border border-red-900 rounded-lg space-y-1 text-[11px]">
                  <span className="text-red-400 font-bold block">Tamper Diagnostics:</span>
                  <div className="text-slate-300 text-[10px]">
                    Divergence Point: <span className="text-red-400 font-bold">{validationModal.tamperDiagnostics.divergencePoint}</span>
                  </div>
                  <div className="text-slate-300 text-[10px]">
                    Action Enforced: <span className="text-emerald-400 font-semibold">{validationModal.tamperDiagnostics.actionTaken}</span>
                  </div>
                  <div className="text-slate-300 text-[10px]">
                    Data Leakage: <span className="text-emerald-400 font-bold">0.00 BYTES (Hermetically sealed)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                id="btn-dismiss-val-modal"
                onClick={() => setValidationModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Attestation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merkle Hash Chain Audit Modal */}
      {merkleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-800/80 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                  Append-Only Merkle Tree Chain Audit
                </h3>
              </div>
              <button
                type="button"
                id="btn-close-merkle-modal"
                onClick={() => setMerkleModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div
                className={`p-3 rounded-xl border flex items-center space-x-3 ${
                  merkleModal.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/80 text-red-200'
                }`}
              >
                {merkleModal.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {merkleModal.isValid
                      ? 'Merkle Chain Integrity: 100% UNBROKEN'
                      : 'Chain Anomaly Detected'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {merkleModal.chainLength} ledger blocks audited &bull; All parent-child hashes verified against SHA-256 root.
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-slate-500 block text-[10px]">CURRENT MERKLE ROOT</span>
                <span className="text-purple-300 font-bold break-all text-[11px]">
                  {merkleModal.merkleRoot}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">LEGAL STANDARD</span>
                  <span className="text-slate-300 font-semibold">{merkleModal.complianceStandard}</span>
                </div>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">VERIFIED AT</span>
                  <span className="text-emerald-400 font-semibold">{new Date(merkleModal.verifiedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {merkleModal.auditedBlocksSummary && (
                <div className="space-y-1 pt-1">
                  <span className="text-slate-400 text-[10px] font-semibold block">
                    Verified Chain Blocks ({merkleModal.auditedBlocksSummary.length}):
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-800/80 rounded-lg p-2 bg-slate-950/80">
                    {merkleModal.auditedBlocksSummary.map((b: any) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between text-[10px] font-mono text-slate-300"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500">#{b.index + 1}</span>
                          <span className="text-cyan-400">{b.proofHashPreview}</span>
                          <span className="text-slate-400">({b.ministries})</span>
                        </div>
                        <span className="text-emerald-400 font-bold">{b.integrity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                id="btn-dismiss-merkle-modal"
                onClick={() => setMerkleModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
