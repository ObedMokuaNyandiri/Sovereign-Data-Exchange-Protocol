'use client';

import React from 'react';
import {
  ShieldCheck,
  FileText,
  Database,
} from 'lucide-react';

interface HeaderProps {
  onOpenPitch: () => void;
  onOpenSchema: () => void;
}

export function Header({
  onOpenPitch,
  onOpenSchema,
}: HeaderProps) {
  return (
    <header id="sdep-header-nav" className="sticky top-0 z-40 border-b border-[var(--sdep-border)] bg-[rgba(7,16,24,0.94)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="hidden h-9 w-1 overflow-hidden rounded-full sm:flex sm:flex-col">
            <span className="flex-1 bg-black" />
            <span className="flex-1 bg-[#b91c1c]" />
            <span className="flex-1 bg-[#15803d]" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--sdep-teal-strong)] bg-[rgba(78,214,193,0.12)] text-[var(--sdep-teal)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-[0.12em] text-[var(--sdep-text)]">SDEP</h1>
              <span className="rounded-full border border-[var(--sdep-border-strong)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sdep-text-subtle)]">Official simulation</span>
            </div>
            <p className="text-xs text-[var(--sdep-text-muted)]">Sovereign Data Exchange Protocol &middot; Inter-ministerial verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-open-schema"
            onClick={onOpenSchema}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--sdep-border)] bg-[var(--sdep-surface)] px-3 py-2 text-xs font-semibold text-[var(--sdep-text-muted)] transition hover:border-[var(--sdep-border-strong)] hover:text-[var(--sdep-text)]"
          >
            <Database className="h-3.5 w-3.5 text-[var(--sdep-blue)]" />
            <span className="hidden sm:inline">Data protection</span>
          </button>

          <button
            type="button"
            id="btn-open-pitch"
            onClick={onOpenPitch}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--sdep-teal-strong)] px-3 py-2 text-xs font-semibold text-[#04100e] transition hover:bg-[var(--sdep-teal)]"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Executive briefing</span>
          </button>
        </div>
      </div>
    </header>
  );
}

