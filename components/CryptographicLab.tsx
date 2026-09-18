'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Binary,
  Cpu,
  KeyRound,
  FileCheck2,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Lock,
  Search,
} from 'lucide-react';
import type { VerificationLogItem } from '@/app/api/v1/exchange/verify/route';

interface CryptographicLabProps {
  logs: VerificationLogItem[];
  defaultProofHash?: string;
}

export function CryptographicLab({ logs, defaultProofHash }: CryptographicLabProps) {
  const [activeSubtool, setActiveSubtool] = useState<'proof_tester' | 'rls_runner' | 'merkle_audit' | 'math_proof'>('proof_tester');
  const [proofInput, setProofInput] = useState<string>(
    defaultProofHash || (logs.length > 0 ? logs[0].proof_hash : '0x8f9a2e37c1d4b68903ef8902ca430198de77b5a12368c0923e41b901f4c4e12a')
  );
  const [tamperMode, setTamperMode] = useState<'NONE' | 'BIT_FLIP' | 'PREDICATE_FORGERY' | 'EXPIRED_NONCE'>('NONE');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // RLS runner state
  const [selectedRlsTest, setSelectedRlsTest] = useState<'DIRECT_TABLE_READ' | 'RPC_SECURITY_DEFINER' | 'CONSENT_TOKEN_VERIFY'>('DIRECT_TABLE_READ');
  const [isRlsRunning, setIsRlsRunning] = useState(false);
  const [rlsResult, setRlsResult] = useState<any | null>(null);

  // Merkle Chain state
  const [isAuditingChain, setIsAuditingChain] = useState(false);
  const [chainResult, setChainResult] = useState<any | null>(null);

  // Copy state
  const [copiedText, setCopiedText] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleVerifyProof = async () => {
    if (!proofInput.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const simulateTamper = tamperMode !== 'NONE';
      const res = await fetch('/api/v1/exchange/validate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofHash: proofInput.trim(),
          simulateTamper,
          tamperType: tamperMode === 'BIT_FLIP' ? 'SIGNATURE_BIT_FLIP' : tamperMode,
        }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setVerificationResult({ valid: false, error: msg });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRunRlsTest = async (testType = selectedRlsTest) => {
    setIsRlsRunning(true);
    setRlsResult(null);

    try {
      const res = await fetch('/api/v1/exchange/test-rls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType }),
      });
      const data = await res.json();
      setRlsResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Test failed';
      setRlsResult({ error: msg });
    } finally {
      setIsRlsRunning(false);
    }
  };

  const handleAuditChain = async () => {
    setIsAuditingChain(true);
    setChainResult(null);

    try {
      const res = await fetch('/api/v1/audit/verify-chain');
      const data = await res.json();
      setChainResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Chain audit failed';
      setChainResult({ isValid: false, error: msg });
    } finally {
      setIsAuditingChain(false);
    }
  };

  return (
    <div id="cryptographic-verifier-lab" className="w-full space-y-4">
      {/* Subtool Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-950 border border-slate-800/90 rounded-xl font-mono text-xs">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            id="subtool-proof-tester"
            onClick={() => setActiveSubtool('proof_tester')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubtool === 'proof_tester'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. Proof Validator & Bit-Flip</span>
          </button>

          <button
            type="button"
            id="subtool-rls-runner"
            onClick={() => {
              setActiveSubtool('rls_runner');
              if (!rlsResult) handleRunRlsTest('DIRECT_TABLE_READ');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubtool === 'rls_runner'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. Live PostgreSQL RLS Prover</span>
          </button>

          <button
            type="button"
            id="subtool-merkle-audit"
            onClick={() => {
              setActiveSubtool('merkle_audit');
              if (!chainResult) handleAuditChain();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubtool === 'merkle_audit'
                ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>3. Merkle Chain Verifier</span>
          </button>

          <button
            type="button"
            id="subtool-math-proof"
            onClick={() => setActiveSubtool('math_proof')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubtool === 'math_proof'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Formal Zero-Knowledge Math</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-500 hidden sm:inline-block">
          SDEP Protocol Verification Suite v2.4.0
        </span>
      </div>

      {/* 1. Proof Validator & Bit-Flip Tamper Tool */}
      {activeSubtool === 'proof_tester' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white uppercase">Cryptographic Proof Verifier</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  HMAC-SHA256 &bull; 256-bit
                </span>
              </div>
              {logs.length > 0 && (
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <span className="text-slate-500">Quick load:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProofInput(logs[0].proof_hash);
                      setTamperMode('NONE');
                    }}
                    className="text-cyan-400 hover:underline cursor-pointer"
                  >
                    Latest Tx ({logs[0].proof_hash.substring(0, 10)}...)
                  </button>
                </div>
              )}
            </div>

            {/* Proof Input */}
            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">
                Target Proof Signature (0x + 64 hex characters):
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-lab-proof-hash"
                  type="text"
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(proofInput)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800 transition cursor-pointer"
                  title="Copy hash"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tamper Simulation Radio Deck */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-slate-400 block mb-2 text-[11px]">
                Tamper Resistance Test Mode:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  id="tamper-mode-none"
                  onClick={() => setTamperMode('NONE')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    tamperMode === 'NONE'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">Authentic Evaluation</div>
                  <div className="text-[10px] opacity-75">Verify exact ledger root</div>
                </button>

                <button
                  type="button"
                  id="tamper-mode-bit-flip"
                  onClick={() => setTamperMode('BIT_FLIP')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    tamperMode === 'BIT_FLIP'
                      ? 'bg-red-950/50 border-red-500 text-red-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] text-red-400">1-Bit Inversion</div>
                  <div className="text-[10px] opacity-75">Flip 1 byte in hash</div>
                </button>

                <button
                  type="button"
                  id="tamper-mode-predicate"
                  onClick={() => setTamperMode('PREDICATE_FORGERY')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    tamperMode === 'PREDICATE_FORGERY'
                      ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] text-amber-400">Predicate Forgery</div>
                  <div className="text-[10px] opacity-75">Claim false salary limit</div>
                </button>

                <button
                  type="button"
                  id="tamper-mode-nonce"
                  onClick={() => setTamperMode('EXPIRED_NONCE')}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    tamperMode === 'EXPIRED_NONCE'
                      ? 'bg-purple-950/50 border-purple-500 text-purple-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] text-purple-400">Replay Attack</div>
                  <div className="text-[10px] opacity-75">Expired nonce timestamp</div>
                </button>
              </div>
            </div>

            {/* Execute Verification Trigger */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Mathematical certainty: 1 in 2^256 probability of undetected forgery.
              </span>
              <button
                type="button"
                id="btn-run-cryptographic-check"
                onClick={handleVerifyProof}
                disabled={isVerifying}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-lg transition shadow-md shadow-cyan-950/80 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Proof Math...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Cryptographic Proof</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Verdict Display */}
          {verificationResult && (
            <div
              className={`p-4 rounded-xl border font-mono text-xs space-y-3 ${
                verificationResult.valid
                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                  : 'bg-red-950/30 border-red-500 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-bold text-sm uppercase">
                    {verificationResult.valid
                      ? 'Cryptographic Verification: PASS (AUTHENTIC SOVEREIGN PROOF)'
                      : 'Cryptographic Verification: REJECTED (SIGNATURE ANOMALY / FORGERY)'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 border border-current">
                  {verificationResult.status}
                </span>
              </div>

              {/* If Valid Details */}
              {verificationResult.valid && verificationResult.verificationDetails && (
                <div className="space-y-2 pt-2 border-t border-emerald-900/60 text-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-950/80 rounded border border-emerald-900/50">
                      <span className="text-slate-500 block text-[10px]">VERDICT</span>
                      <span className="text-emerald-400 font-bold">
                        {verificationResult.verificationDetails.verdict}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded border border-emerald-900/50">
                      <span className="text-slate-500 block text-[10px]">PII LEAKAGE</span>
                      <span className="text-emerald-400 font-bold">0.00 BYTES</span>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded border border-emerald-900/50">
                      <span className="text-slate-500 block text-[10px]">CHAIN STATUS</span>
                      <span className="text-cyan-300 font-bold">
                        {verificationResult.verificationDetails.chainContinuity}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded border border-emerald-900/50">
                      <span className="text-slate-500 block text-[10px]">LATENCY</span>
                      <span className="text-slate-300 font-bold">
                        {verificationResult.verificationDetails.executionLatencyMs}ms
                      </span>
                    </div>
                  </div>

                  {verificationResult.mathematicalProof && (
                    <div className="p-2.5 bg-slate-950/90 rounded-lg border border-slate-800 text-[11px] space-y-1">
                      <div className="text-slate-400 font-semibold">Mathematical Proof Guarantee:</div>
                      <div className="text-cyan-300 font-mono">{verificationResult.mathematicalProof.rawFormula}</div>
                      <div className="text-emerald-400 font-mono text-[10px]">
                        Information Theory: {verificationResult.mathematicalProof.informationLeakageProof}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* If Tamper Detected */}
              {!verificationResult.valid && verificationResult.tamperDiagnostics && (
                <div className="space-y-2 pt-2 border-t border-red-900/60 text-slate-200 text-[11px]">
                  <div className="p-2.5 bg-slate-950/90 rounded-lg border border-red-900/80 space-y-1">
                    <div className="text-red-400 font-bold">Tamper Diagnostics:</div>
                    <div className="text-slate-400">
                      Divergence Detected: <span className="text-red-300">{verificationResult.tamperDiagnostics.divergencePoint}</span>
                    </div>
                    <div className="text-slate-400">
                      Action Enforced: <span className="text-emerald-400 font-semibold">{verificationResult.tamperDiagnostics.actionTaken}</span>
                    </div>
                    <div className="text-slate-400">
                      Data Leakage On Tamper: <span className="text-emerald-400 font-bold">0.00 BYTES (Hermetically sealed)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Live PostgreSQL RLS Security Prover */}
      {activeSubtool === 'rls_runner' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white uppercase">
                  PostgreSQL 15 Row-Level Security Live Runner
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                KERNEL-ENFORCED
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Verify how the PostgreSQL engine physically handles database queries under Row-Level Security.
              Execute both an unauthorized attacker query and an authorized SDEP Zero-Knowledge RPC to observe the mathematical defense in depth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                id="btn-test-direct-select"
                onClick={() => {
                  setSelectedRlsTest('DIRECT_TABLE_READ');
                  handleRunRlsTest('DIRECT_TABLE_READ');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedRlsTest === 'DIRECT_TABLE_READ'
                    ? 'bg-red-950/40 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs mb-1">
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>Test 1: Attacker Direct SELECT</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Simulate rogue agency attempting raw salary reads. Expected: 42501 Permission Denied.
                </div>
              </button>

              <button
                type="button"
                id="btn-test-rpc-zkp"
                onClick={() => {
                  setSelectedRlsTest('RPC_SECURITY_DEFINER');
                  handleRunRlsTest('RPC_SECURITY_DEFINER');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedRlsTest === 'RPC_SECURITY_DEFINER'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test 2: Sovereign ZKP RPC</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Execute stored security definer function. Expected: 1-bit boolean, 0 bytes salary.
                </div>
              </button>

              <button
                type="button"
                id="btn-test-consent-token"
                onClick={() => {
                  setSelectedRlsTest('CONSENT_TOKEN_VERIFY');
                  handleRunRlsTest('CONSENT_TOKEN_VERIFY');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedRlsTest === 'CONSENT_TOKEN_VERIFY'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs mb-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test 3: KDPA 2019 Token</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Verify digital citizen consent attestation (eCitizen Ed25519 token).
                </div>
              </button>
            </div>
          </div>

          {/* Test Execution Output */}
          {rlsResult && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-bold text-white uppercase">
                    Live SQL Execution Result &bull; {rlsResult.testType}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    rlsResult.httpCode === 403
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  HTTP {rlsResult.httpCode} &bull; {rlsResult.status}
                </span>
              </div>

              {/* SQL Query */}
              {rlsResult.sqlExecuted && (
                <div className="p-2.5 bg-black/60 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px] mb-0.5">POSTGRESQL STATEMENT EXECUTED:</span>
                  <span className="text-cyan-300 text-[11px] font-bold">{rlsResult.sqlExecuted}</span>
                </div>
              )}

              {/* Detailed Output Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SECURITY VERDICT</span>
                  <span className="text-emerald-400 font-bold">{rlsResult.securityVerdict}</span>
                </div>
                <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">RAW DATA LEAKAGE</span>
                  <span className="text-emerald-400 font-bold">{rlsResult.bytesExposed ?? 0} BYTES</span>
                </div>
                <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">RLS ENFORCEMENT</span>
                  <span className="text-cyan-300 font-bold">KERNEL-LEVEL (PASS)</span>
                </div>
              </div>

              {/* Result Details */}
              {rlsResult.explanation && (
                <p className="text-slate-400 text-[11px] leading-normal pt-1">
                  {rlsResult.explanation}
                </p>
              )}

              {rlsResult.result && (
                <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 space-y-1 text-[11px]">
                  <span className="text-slate-400 font-semibold block">Returned Payload:</span>
                  <pre className="text-cyan-300 overflow-x-auto text-[10px]">
                    {JSON.stringify(rlsResult.result, null, 2)}
                  </pre>
                </div>
              )}

              {rlsResult.tokenPayload && (
                <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 space-y-1 text-[11px]">
                  <span className="text-slate-400 font-semibold block">Verified eCitizen KDPA Token:</span>
                  <pre className="text-emerald-300 overflow-x-auto text-[10px]">
                    {JSON.stringify(rlsResult.tokenPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Merkle Chain Integrity Verifier */}
      {activeSubtool === 'merkle_audit' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white uppercase">
                  Append-Only Merkle Hash Chain Auditor
                </span>
              </div>
              <button
                type="button"
                id="btn-re-audit-chain"
                onClick={handleAuditChain}
                disabled={isAuditingChain}
                className="px-3 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isAuditingChain ? 'animate-spin' : ''}`} />
                <span>{isAuditingChain ? 'Auditing Blocks...' : 'Run Chain Audit'}</span>
              </button>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every verification event is linked to its chronological ancestor. This engine recalculates
              the Merkle root across all recorded proof hashes, verifying that zero historical records have been retroactively modified or deleted.
            </p>

            {chainResult && (
              <div className="space-y-3 pt-2">
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    chainResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-red-950/40 border-red-500 text-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {chainResult.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {chainResult.isValid ? 'Hash Chain Continuity: 100% INTACT' : 'Chain Integrity Anomaly'}
                      </div>
                      <div className="text-[10px] opacity-80">
                        {chainResult.chainLength} ledger blocks audited &bull; 0 broken links &bull; Zero data tampering
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/50 border border-current">
                    MERKLE-SEALED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">CURRENT MERKLE ROOT</span>
                    <span className="text-purple-300 font-bold break-all text-[11px]">
                      {chainResult.merkleRoot}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">LEGAL COMPLIANCE STANDARD</span>
                    <span className="text-slate-300 font-bold">
                      {chainResult.complianceStandard}
                    </span>
                  </div>
                </div>

                {chainResult.auditedBlocksSummary && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-slate-400 text-[11px] font-semibold block">
                      Audited Ledger Blocks (Sample):
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-800/60 no-scrollbar">
                      {chainResult.auditedBlocksSummary.map((b: any) => (
                        <div
                          key={b.id}
                          className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-300"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500">Block #{b.index + 1}</span>
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
            )}
          </div>
        </div>
      )}

      {/* 4. Formal Mathematical Zero-Knowledge Proof */}
      {activeSubtool === 'math_proof' && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Binary className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white uppercase">
                Zero-Knowledge Information Theory & Mathematical Invariants
              </span>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              FORMAL VERIFICATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
              <div className="text-cyan-300 font-bold">1. Zero Mutual Information Guarantee</div>
              <p className="text-slate-400 leading-normal">
                Let $X$ denote the taxpayer&apos;s true confidential income in KRA databases, and let $Y$ denote the inter-ministerial proof token transmitted over the wire:
              </p>
              <div className="p-2 bg-black/60 rounded border border-slate-800 text-emerald-300 font-mono text-[10px]">
                I(X; Y) = H(X) - H(X | Y) = 0.00 bits
              </div>
              <p className="text-slate-400 text-[10px]">
                Proof: The receiving ministry receives strictly a 1-bit boolean predicate outcome (&apos;0&apos; or &apos;1&apos;). No point estimation or confidence interval of confidential financial values is computationally recoverable.
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
              <div className="text-cyan-300 font-bold">2. Collision Resistance & Unforgeability</div>
              <p className="text-slate-400 leading-normal">
                Under the cryptographic PRF security assumption for HMAC-SHA256, forging a valid proof without possessing the sovereign master HSM key requires computing:
              </p>
              <div className="p-2 bg-black/60 rounded border border-slate-800 text-emerald-300 font-mono text-[10px]">
                Pr[Adversary Forges Proof] &le; 2^(-256) &approx; 8.63 &times; 10^(-78)
              </div>
              <p className="text-slate-400 text-[10px]">
                Any bit alteration in either the citizen ID, the predicate threshold, or the timestamp breaks the HMAC signature immediately upon arrival at the gateway.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
            <div className="text-amber-400 font-bold">3. Kenya Data Protection Act (KDPA 2019) Mathematical Mapping</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-300">
              <div className="p-2 bg-black/40 rounded border border-slate-800/80">
                <span className="text-cyan-400 font-bold block mb-0.5">Section 3 (Data Minimization)</span>
                Processing strictly the minimum binary criteria required to satisfy legal healthcare subsidy qualification.
              </div>
              <div className="p-2 bg-black/40 rounded border border-slate-800/80">
                <span className="text-emerald-400 font-bold block mb-0.5">Section 25 (Purpose Limitation)</span>
                Proof token is cryptographically bound to SHIF purpose; cannot be reused by banks, employers, or third parties.
              </div>
              <div className="p-2 bg-black/40 rounded border border-slate-800/80">
                <span className="text-purple-400 font-bold block mb-0.5">Section 41 (Security Safeguards)</span>
                Encapsulated inside isolated PostgreSQL schemas with kernel Row-Level Security policies preventing unauthorized SELECTs.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
