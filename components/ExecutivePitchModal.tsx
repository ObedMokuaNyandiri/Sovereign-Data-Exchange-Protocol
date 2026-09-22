'use client';

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  X,
  Sparkles,
  Zap,
  Building,
  Lock,
  ArrowRight,
  TrendingDown,
  Database,
  Activity,
  Key,
} from 'lucide-react';

interface ExecutivePitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutivePitchModal({ isOpen, onClose }: ExecutivePitchModalProps) {
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const pitchScript = `Cabinet Secretaries and Principal Secretaries,

The 2025–2030 National AI Strategy calls for a National Data Exchange. However, traditional data sharing creates risks. Moving databases creates central honey-pots for hackers, infringes on citizen privacy, and strips ministries of data stewardship.

What we are demonstrating today is Verification Without Exposure.

When the Ministry of Health needs to verify if a citizen qualifies for a healthcare subsidy, it does not need KRA's database. It only needs a simple answer: Does this citizen qualify?

With the Sovereign Data Exchange Protocol (SDEP), SHIF sends a cryptographic query. KRA's database runs the logic internally and returns a signed mathematical proof.

The Ministry of Health gets its answer instantly. KRA retains complete ownership of its data. Zero bytes of citizen salary information leave KRA servers.

This architecture resolves the trade-off between inter-ministerial collaboration and data privacy. It is secure, fully compliant with the Data Protection Act, costs nothing in extra software licensing, and provides a clear path forward for national digital infrastructure.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[var(--sdep-surface)] border border-[var(--sdep-border-strong)] rounded-2xl max-w-3xl w-full p-6 sm:p-8 text-[var(--sdep-text)] shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          type="button"
          id="btn-close-pitch-modal"
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--sdep-text-subtle)] hover:text-[var(--sdep-text)] p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-[var(--sdep-border)]">
          <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center text-[var(--sdep-success)]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--sdep-text)] tracking-tight">
                Cabinet Briefing & Executive Strategic Script
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[rgba(16,185,129,0.1)] text-[var(--sdep-success)] border border-[rgba(16,185,129,0.3)]">
                OFFICIAL BRIEFING
              </span>
            </div>
            <p className="text-xs text-[var(--sdep-text-muted)]">
              National AI Strategy 2025–2030 &bull; Office of the President Directive
            </p>
          </div>
        </div>

        {/* Strategic Script Box */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--sdep-success)] flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Spoken Pitch (Word-for-Word)
            </span>
            <button
              type="button"
              id="btn-copy-pitch-script"
              onClick={handleCopy}
              className="text-xs font-mono text-[var(--sdep-teal)] hover:text-[var(--sdep-teal-strong)] flex items-center gap-1.5 cursor-pointer bg-[var(--sdep-ink)] px-2.5 py-1 rounded border border-[var(--sdep-border)]"
            >
              {copiedScript ? <Check className="w-3 h-3 text-[var(--sdep-success)]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedScript ? 'Copied to Clipboard' : 'Copy Full Speech'}</span>
            </button>
          </div>

          <div className="bg-[var(--sdep-ink)] border border-[var(--sdep-border)] rounded-xl p-5 text-xs sm:text-sm text-[var(--sdep-text)] font-sans leading-relaxed whitespace-pre-line border-l-4 border-l-[var(--sdep-success)]">
            {pitchScript}
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-[var(--sdep-text-muted)] uppercase tracking-wider font-mono mb-3">
            Core Architectural Value Propositions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[var(--sdep-ink)] border border-[var(--sdep-border)] rounded-xl shadow-sm">
              <div className="flex items-center space-x-2 text-[var(--sdep-success)] font-semibold mb-1">
                <Database className="w-4 h-4" />
                <span>Absolute Data Sovereignty</span>
              </div>
              <p className="text-[var(--sdep-text-subtle)] text-[11px] leading-normal">
                Agencies retain complete physical and logical custody of their citizen data. Eliminates centralized data lakes and structural honey-pots.
              </p>
            </div>

            <div className="p-3.5 bg-[var(--sdep-ink)] border border-[var(--sdep-border)] rounded-xl shadow-sm">
              <div className="flex items-center space-x-2 text-[var(--sdep-teal)] font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacy-Preserving Verification</span>
              </div>
              <p className="text-[var(--sdep-text-subtle)] text-[11px] leading-normal">
                Information exchange is strictly limited to cryptographic boolean proofs. Validates truth across ministries without exposing raw records.
              </p>
            </div>

            <div className="p-3.5 bg-[var(--sdep-ink)] border border-[var(--sdep-border)] rounded-xl shadow-sm">
              <div className="flex items-center space-x-2 text-[var(--sdep-warning)] font-semibold mb-1">
                <Activity className="w-4 h-4" />
                <span>Tamper-Evident Audit Trails</span>
              </div>
              <p className="text-[var(--sdep-text-subtle)] text-[11px] leading-normal">
                Every inter-agency query is cryptographically logged on an immutable ledger, ensuring absolute accountability and transparency.
              </p>
            </div>

            <div className="p-3.5 bg-[var(--sdep-ink)] border border-[var(--sdep-border)] rounded-xl shadow-sm">
              <div className="flex items-center space-x-2 text-[var(--sdep-blue)] font-semibold mb-1">
                <Key className="w-4 h-4" />
                <span>Granular Access Control</span>
              </div>
              <p className="text-[var(--sdep-text-subtle)] text-[11px] leading-normal">
                Strict Role-Level Security (RLS) ensures that data verification is exclusively accessible to authorized cryptographic identities.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--sdep-border)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--sdep-text-subtle)] font-mono">
            Classified Document: Republic of Kenya SDEP Blueprint
          </span>
          <button
            type="button"
            id="btn-dismiss-pitch"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--sdep-success)] hover:bg-[#059669] text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
