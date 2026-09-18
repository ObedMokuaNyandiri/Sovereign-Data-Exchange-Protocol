'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ArrowRight,
  Database,
  Lock,
  Cpu,
  Key,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  Server,
  Share2,
} from 'lucide-react';
import type { UseCaseConfig } from './UseCaseSelector';

export interface VerificationResult {
  eligible: boolean;
  taxCompliant?: boolean;
  proofHash: string;
  timestamp: string;
  queryPredicate: string;
  latencyMs: number;
  nationalIdHashPreview: string;
  source: string;
  requestingMinistry: string;
  originatingMinistry: string;

  // Real-world 2.75% Loophole Fields
  verification_id?: string;
  citizen_id?: string;
  flags?: {
    is_compliant_taxpayer: boolean;
    has_undeclared_activity: boolean;
    income_band_verified: string;
    mti_conflict_detected: boolean;
  };
  risk_assessment?: 'FLAG_FRAUD' | 'FLAG_ASSET_MISMATCH' | 'VERIFIED_OK';
  risk_label?: string;
  risk_description?: string;
  variance_status?: string;
  recommended_action?: string;
  data_exposed_bytes?: number;
  channel_direction?: 'SHIF_TO_KRA' | 'KRA_TO_SHIF';
}

interface NodeCanvasProps {
  useCase: UseCaseConfig;
  isExecuting: boolean;
  currentStep: number; // 0: idle, 1: hash, 2: dispatch, 3: evaluate, 4: sign, 5: completed
  lastResult: VerificationResult | null;
  errorMessage: string | null;
}

export function NodeCanvas({
  useCase,
  isExecuting,
  currentStep,
  lastResult,
  errorMessage,
}: NodeCanvasProps) {
  const steps = [
    { label: 'Raw National ID', desc: 'Held only in local client RAM', icon: Key },
    { label: 'SHA-256 Hash', desc: 'One-way irreversible digest', icon: Lock },
    { label: 'Zero-Knowledge RPC', desc: 'Predicate query over isolated wire', icon: Cpu },
    { label: 'PostgreSQL In-Memory', desc: 'Runs inside isolated schema', icon: Database },
    { label: 'HMAC Signed Proof', desc: 'Cryptographic boolean signature', icon: Shield },
  ];

  return (
    <div
      id="sdep-node-connection-canvas"
      className="w-full bg-[#080d16] border border-slate-800/90 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-2xl"
    >
      {/* Background Grid Pattern & Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 relative z-10 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
            Live Node Topology: {useCase.requestingShort} &harr; {useCase.targetShort}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            PROTOCOL: SDEP-ZKP-v2
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">WIRELESS ZERO-LEAKAGE BUS</span>
        </div>
      </div>

      {/* The 3 Main Interactive Nodes (Left: Requesting Terminal, Center: ZKP Engine, Right: Target Vault) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center relative z-10">
        {/* NODE A: Requesting Ministry Terminal (4 Cols) */}
        <div
          id="canvas-node-requesting"
          className={`lg:col-span-4 rounded-xl p-4 sm:p-5 border transition-all duration-300 relative ${
            isExecuting && (currentStep === 1 || currentStep === 2)
              ? 'bg-slate-900/95 border-cyan-500 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                REQUESTING NODE
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1.5 flex items-center gap-2">
                {useCase.requestingMinistry}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{useCase.requestingShort}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="text-slate-500">Query Mode:</span>
              <span className="text-cyan-300 font-semibold">Predicate Query Only</span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="text-slate-500">Raw Data Access:</span>
              <span className="text-red-400 font-semibold">0% (Forbidden)</span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="text-slate-500">Node Status:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                SECURE TERMINAL
              </span>
            </div>
          </div>

          {/* Glowing pulse indicator when sending query */}
          {isExecuting && currentStep <= 2 && (
            <motion.div
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400"
              animate={{ scale: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}
        </div>

        {/* NODE B (CENTER): Cryptographic Zero-Knowledge Gateway (4 Cols) */}
        <div
          id="canvas-node-center-engine"
          className={`lg:col-span-4 rounded-xl p-4 sm:p-5 border transition-all duration-300 text-center relative ${
            isExecuting
              ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/40'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          {/* Animated Connecting Streams */}
          <div className="hidden lg:block absolute left-0 top-1/2 -translate-x-full w-6 h-0.5 bg-gradient-to-r from-transparent to-emerald-500/80" />
          <div className="hidden lg:block absolute right-0 top-1/2 translate-x-full w-6 h-0.5 bg-gradient-to-l from-transparent to-emerald-500/80" />

          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-300 uppercase">
              SDEP Cryptographic Gateway
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Mathematical Predicate Prover &bull; Zero Raw Citizen Data Exposure
          </p>

          {/* Current Transformation State Badge */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] min-h-[58px] flex flex-col items-center justify-center">
            {isExecuting ? (
              <div className="flex items-center space-x-2 text-emerald-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                </motion.div>
                <span>
                  {currentStep === 1 && '1. SHA-256 Hashing Identifier...'}
                  {currentStep === 2 && '2. Transmitting ZKP Payload...'}
                  {currentStep === 3 && '3. PostgreSQL In-Memory Evaluation...'}
                  {currentStep === 4 && '4. Signing HMAC Cryptographic Proof...'}
                  {currentStep === 5 && '5. Verification Complete!'}
                </span>
              </div>
            ) : lastResult ? (
              <div className="text-left w-full space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Result Verdict:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      lastResult.eligible
                        ? 'bg-emerald-900 text-emerald-300 border border-emerald-600'
                        : 'bg-amber-900 text-amber-300 border border-amber-600'
                    }`}
                  >
                    {lastResult.eligible ? 'QUALIFIED (TRUE)' : 'DISQUALIFIED (FALSE)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 truncate">
                  <span className="text-slate-500">Proof:</span>
                  <span className="text-cyan-300 truncate font-mono ml-2">
                    {lastResult.proofHash.substring(0, 16)}...
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-slate-500 italic">Standby for cryptographic dispatch</span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold">0.00 B Exposed</span>
            <span>&bull;</span>
            <span className="text-cyan-400">HMAC-SHA256</span>
          </div>
        </div>

        {/* NODE C: Target Vault Node (KRA Vault) (4 Cols) */}
        <div
          id="canvas-node-target-vault"
          className={`lg:col-span-4 rounded-xl p-4 sm:p-5 border transition-all duration-300 relative ${
            isExecuting && (currentStep === 3 || currentStep === 4)
              ? 'bg-slate-900/95 border-emerald-500 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                TARGET DATA VAULT
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1.5 flex items-center gap-2">
                {useCase.targetVault}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{useCase.targetShort}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="text-slate-500">Schema Isolation:</span>
              <span className="text-emerald-300 font-semibold">kra_vault (RLS Active)</span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="text-slate-500">Income Column:</span>
              <span className="text-amber-400 font-semibold">LOCKED &bull; NO SELECT</span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="text-slate-500">Vault Autonomous:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                SILO SECURE
              </span>
            </div>
          </div>

          {/* Glowing indicator when evaluating inside vault */}
          {isExecuting && (currentStep === 3 || currentStep === 4) && (
            <motion.div
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400"
              animate={{ scale: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}
        </div>
      </div>

      {/* Animated Data Stream Wire */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Cryptographic Transformation Pipeline</span>
          <span className="text-slate-500">End-to-End Zero-Exposure Proof Chain</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCurrent = isExecuting && currentStep === stepNum;
            const isCompleted = currentStep > stepNum || (!isExecuting && lastResult !== null);
            const StepIcon = step.icon;

            return (
              <div
                key={step.label}
                className={`p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-sm shadow-emerald-500/20'
                    : isCompleted
                    ? 'bg-slate-900 border-slate-700/80 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      isCurrent
                        ? 'bg-emerald-500 text-black font-bold'
                        : isCompleted
                        ? 'bg-emerald-900/80 text-emerald-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <StepIcon className="w-3 h-3" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    0{stepNum}
                  </span>
                </div>
                <div className="font-semibold text-xs text-white line-clamp-1">{step.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error state if any */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
