'use client';

import React from 'react';
import {
  HeartPulse,
  Building2,
  GraduationCap,
  Car,
  FileCheck,
  ArrowRight,
  Shield,
  CheckCircle,
} from 'lucide-react';

export interface UseCaseConfig {
  id: string;
  name: string;
  requestingMinistry: string;
  requestingShort: string;
  targetVault: string;
  targetShort: string;
  predicateLabel: string;
  defaultPredicateValue: number | string;
  traditionalRisk: string;
  zkpValueDelivered: string;
  icon: React.ComponentType<{ className?: string }>;
  suggestedIds: { label: string; id: string; note: string }[];
}

export const USE_CASES: UseCaseConfig[] = [
  {
    id: 'shif-kra-275',
    name: '2.75% Loophole: SHIF → KRA',
    requestingMinistry: 'Social Health Authority (SHA / SHIF)',
    requestingShort: 'SHA Means-Testing Node',
    targetVault: 'Kenya Revenue Authority (KRA Red Vault)',
    targetShort: 'KRA Red Vault',
    predicateLabel: 'Declared Income & MTI Proxy Check',
    defaultPredicateValue: 0,
    traditionalRisk: 'Wealthy traders claim KES 0.00 Indigent status to pay minimum KES 300/mo while hiding millions in turnover & port imports.',
    zkpValueDelivered: 'Calculates Real_Income (PAYE + TOT + Rental + iCMS) and detects misrepresentation with 0 BYTES raw tax files exposed.',
    icon: HeartPulse,
    suggestedIds: [
      { label: 'J. Kamau (ID-29384722)', id: '29384722', note: 'Declared 0 | 4.5M iCMS Port Imports (Asset Mismatch)' },
      { label: 'A. Ochieng (ID-33921001)', id: '33921001', note: 'Declared 42k | PAYE 42k (Verified Match)' },
      { label: 'M. Wanjiku (ID-99887766)', id: '99887766', note: 'Declared 15k | 85k TOT + 12k Rental (Flag Fraud)' },
    ],
  },
  {
    id: 'kra-shif-viceversa',
    name: 'Vice Versa: KRA → SHIF',
    requestingMinistry: 'Kenya Revenue Authority (KRA)',
    requestingShort: 'KRA Tax Audit Desk',
    targetVault: 'Social Health Authority (SHIF Vault)',
    targetShort: 'SHIF Patient Vault',
    predicateLabel: '2.75% Statutory Contribution Audit',
    defaultPredicateValue: 1155,
    traditionalRisk: 'Tax inspectors accessing citizens sensitive medical diagnoses, oncology records, or confidential hospital stays.',
    zkpValueDelivered: 'Verifies 2.75% healthcare deduction compliance with 0 BYTES patient medical history exposed.',
    icon: Shield,
    suggestedIds: [
      { label: 'A. Ochieng (ID-33921001)', id: '33921001', note: 'Statutory 2.75% Up-to-Date (0 B Medical Exposed)' },
      { label: 'J. Kamau (ID-29384722)', id: '29384722', note: 'Under-Deduction Arrears Flagged' },
      { label: 'M. Wanjiku (ID-99887766)', id: '99887766', note: 'Partial Contribution Discrepancy' },
    ],
  },
  {
    id: 'lands-kra',
    name: 'Land Title Transfer Tax Clearance',
    requestingMinistry: 'Ministry of Lands & Physical Planning',
    requestingShort: 'Lands Ardhi Node',
    targetVault: 'Kenya Revenue Authority (KRA Vault)',
    targetShort: 'KRA Data Vault',
    predicateLabel: 'Tax Clearance Compliance Status',
    defaultPredicateValue: 0,
    traditionalRisk: 'Tax evaders bribing registry officials or presenting forged paper compliance certificates.',
    zkpValueDelivered: 'Automated cryptographic verification directly against live KRA ledger without viewing citizen tax returns.',
    icon: Building2,
    suggestedIds: [
      { label: 'A. Ochieng (Valid PIN)', id: '33921001', note: 'Clear for Transfer' },
      { label: 'Wanjiku Kamau (Valid)', id: '12345678', note: 'Compliant Taxpayer' },
    ],
  },
  {
    id: 'helb-social',
    name: 'HELB Vulnerability Bursary Verification',
    requestingMinistry: 'Higher Education Loans Board (HELB)',
    requestingShort: 'HELB Terminal',
    targetVault: 'State Dept. for Social Protection',
    targetShort: 'Social Protection Vault',
    predicateLabel: 'Vulnerability / Income Index Threshold',
    defaultPredicateValue: 30000,
    traditionalRisk: 'Unauthorized inspection of sensitive family distress, orphan records, or death registers.',
    zkpValueDelivered: 'Direct verification of bursary eligibility without paper forms, safeguarding student dignity.',
    icon: GraduationCap,
    suggestedIds: [
      { label: 'Wanjiku Kamau (Eligible)', id: '12345678', note: 'Max Bursary Tier' },
      { label: 'Kipchoge Rotich (Ineligible)', id: '45678901', note: 'Standard Loan Tier' },
    ],
  },
  {
    id: 'ntsa-police',
    name: 'Roadside Driver Warrant Clearance',
    requestingMinistry: 'National Transport and Safety Authority (NTSA)',
    requestingShort: 'NTSA Patrol Node',
    targetVault: 'National Police Service (CR&CB Registry)',
    targetShort: 'Police Warrants Vault',
    predicateLabel: 'Active Criminal Warrant Absence',
    defaultPredicateValue: 0,
    traditionalRisk: 'Traffic officers browsing full sealed criminal history databases on roadside mobile devices.',
    zkpValueDelivered: 'Instant binary check (Clear / Flagged) during traffic stops with zero case disclosure.',
    icon: Car,
    suggestedIds: [
      { label: 'A. Ochieng (Clear)', id: '33921001', note: 'No Active Warrants' },
      { label: 'Flagged Driver', id: '56789012', note: 'Inspection Notice' },
    ],
  },
];

interface UseCaseSelectorProps {
  activeUseCaseId: string;
  onSelectUseCase: (useCase: UseCaseConfig) => void;
}

export function UseCaseSelector({ activeUseCaseId, onSelectUseCase }: UseCaseSelectorProps) {
  return (
    <section id="sdep-use-cases-container" aria-labelledby="scenario-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sdep-teal)]">Choose a verification question</p>
          <h2 id="scenario-heading" className="mt-1 text-xl font-semibold text-[var(--sdep-text)]">What should SDEP verify?</h2>
        </div>
        <p className="max-w-sm text-right text-xs text-[var(--sdep-text-muted)]">Each scenario returns an answer without transferring the protected source record.</p>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {USE_CASES.map((uc) => {
          const Icon = uc.icon;
          const isActive = uc.id === activeUseCaseId;
          return (
            <button
              key={uc.id}
              id={`btn-usecase-${uc.id}`}
              aria-pressed={isActive}
              onClick={() => onSelectUseCase(uc)}
              className={`group min-h-32 rounded-xl border p-3 text-left transition ${
                isActive
                  ? 'border-[var(--sdep-teal)] bg-[rgba(26,168,145,0.14)] shadow-[0_0_0_1px_rgba(78,214,193,0.16)]'
                  : 'border-[var(--sdep-border)] bg-[rgba(16,33,42,0.72)] hover:border-[var(--sdep-border-strong)] hover:bg-[var(--sdep-surface)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isActive ? 'bg-[var(--sdep-teal)] text-[#061018]' : 'bg-[var(--sdep-surface-raised)] text-[var(--sdep-text-muted)]'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {isActive && <CheckCircle className="h-4 w-4 text-[var(--sdep-teal)]" aria-label="Selected" />}
              </div>
              <p className="mt-3 text-sm font-semibold leading-tight text-[var(--sdep-text)]">{uc.name}</p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-[var(--sdep-text-muted)]">
                <span className="truncate">{uc.requestingShort.split(' ')[0]}</span>
                <ArrowRight className="h-3 w-3 shrink-0 text-[var(--sdep-text-subtle)]" />
                <span className="truncate">{uc.targetShort.split(' ')[0]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
