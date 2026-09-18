'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Header } from '@/components/Header';
import { USE_CASES, type UseCaseConfig } from '@/components/UseCaseSelector';
import { FiberOpticStage } from '@/components/FiberOpticStage';
import { CommandDeck } from '@/components/CommandDeck';
import { ExecutivePitchModal } from '@/components/ExecutivePitchModal';
import { DatabaseSchemaModal } from '@/components/DatabaseSchemaModal';
import { ProofVerificationDialog } from '@/components/ProofVerificationDialog';
import type { VerificationResult } from '@/components/NodeCanvas';
import type { VerificationLogItem } from '@/app/api/v1/exchange/verify/route';

export default function SDEPCommandCenterPage() {
  const [activeUseCase, setActiveUseCase] = useState<UseCaseConfig>(USE_CASES[0]);
  const [nationalId, setNationalId] = useState<string>('29384722');
  const [kraPin, setKraPin] = useState<string>('A009123847K');
  const [declaredHouseholdIncome, setDeclaredHouseholdIncome] = useState<number>(0);
  const [mtiProxyScore, setMtiProxyScore] = useState<number>(15);
  const [reqPurpose, setReqPurpose] = useState<'VERIFY_INDIGENT_STATUS' | 'VALIDATE_CONTRIBUTION_BASE'>('VERIFY_INDIGENT_STATUS');
  const [thresholdIncome, setThresholdIncome] = useState<number>(50000);

  // Quick helper to populate citizen presets
  const handleSelectCitizenProfile = (id: string) => {
    setNationalId(id);
    if (id === '29384722') {
      setKraPin('A009123847K');
      setDeclaredHouseholdIncome(0);
      setMtiProxyScore(15);
      setReqPurpose('VERIFY_INDIGENT_STATUS');
    } else if (id === '33921001') {
      setKraPin('A012398471M');
      setDeclaredHouseholdIncome(42000);
      setMtiProxyScore(65);
      setReqPurpose('VALIDATE_CONTRIBUTION_BASE');
    } else if (id === '99887766') {
      setKraPin('P051289347Z');
      setDeclaredHouseholdIncome(15000);
      setMtiProxyScore(32);
      setReqPurpose('VALIDATE_CONTRIBUTION_BASE');
    }
  };

  // Execution & Step animation
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audit logs & metrics
  const [logs, setLogs] = useState<VerificationLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  // Modals
  const [isPitchOpen, setIsPitchOpen] = useState<boolean>(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState<boolean>(false);
  const [validationModalData, setValidationModalData] = useState<any | null>(null);

  const handleVerifyProofHash = async (proofHash: string) => {
    try {
      const res = await fetch('/api/v1/exchange/validate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofHash }),
      });
      const data = await res.json();
      setValidationModalData(data);
    } catch {
      // Handled silently
    }
  };

  // Fetch audit stream and metrics
  const fetchAuditStream = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/audit/stream');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const streamRes = await fetch('/api/v1/audit/stream');

        if (!isMounted) return;

        if (streamRes.ok) {
          const streamData = await streamRes.json();
          if (streamData.logs && isMounted) {
            setLogs(streamData.logs);
          }
        }
      } catch {
        // Handled silently
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);


  // Handle Use Case switch
  const handleSelectUseCase = (uc: UseCaseConfig) => {
    setActiveUseCase(uc);
    if (uc.suggestedIds.length > 0) {
      handleSelectCitizenProfile(uc.suggestedIds[0].id);
    }
    if (typeof uc.defaultPredicateValue === 'number') {
      setThresholdIncome(uc.defaultPredicateValue);
    }
    setErrorMessage(null);
  };

  // Execute Zero-Knowledge RPC Query
  const handleExecuteVerification = async () => {
    if (!nationalId.trim()) return;

    setIsExecuting(true);
    setErrorMessage(null);
    setCurrentStep(1); // Stage 1: Hashing

    try {
      // Progressive step animation
      await new Promise((r) => setTimeout(r, 220));
      setCurrentStep(2); // Stage 2: Transmitting

      await new Promise((r) => setTimeout(r, 220));
      setCurrentStep(3); // Stage 3: Database In-memory evaluation

      const is275Loophole = activeUseCase.id === 'shif-kra-275';
      const isViceVersa = activeUseCase.id === 'kra-shif-viceversa';

      const verificationType = is275Loophole
        ? '275_LOOPHOLE_MEANS_TEST'
        : isViceVersa
        ? 'STATUTORY_RELIEF_AUDIT'
        : activeUseCase.id === 'lands-kra'
        ? 'TAX_CLEARANCE_TRANSFER'
        : activeUseCase.id === 'helb-social'
        ? 'VULNERABILITY_BURSARY'
        : activeUseCase.id === 'ntsa-police'
        ? 'WARRANT_CLEARANCE'
        : 'BIRTH_RECORD_VALIDATION';

      // Fire real API
      const response = await fetch('/api/v1/exchange/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalId: nationalId.trim(),
          citizen_id: nationalId.trim(),
          kraPin: kraPin.trim(),
          kra_pin: kraPin.trim(),
          declaredHouseholdIncome: declaredHouseholdIncome,
          declared_household_income: declaredHouseholdIncome,
          mtiProxyScore: mtiProxyScore,
          mti_proxy_score: mtiProxyScore,
          reqPurpose: reqPurpose,
          req_purpose: reqPurpose,
          channelDirection: isViceVersa ? 'KRA_TO_SHIF' : 'SHIF_TO_KRA',
          channel_direction: isViceVersa ? 'KRA_TO_SHIF' : 'SHIF_TO_KRA',
          requestingMinistry: activeUseCase.requestingMinistry,
          originatingMinistry: activeUseCase.targetVault.includes('KRA')
            ? 'KRA'
            : activeUseCase.targetShort,
          thresholdIncome: thresholdIncome || 50000.0,
          verificationType,
        }),
      });

      setCurrentStep(4); // Stage 4: Signed proof generation
      await new Promise((r) => setTimeout(r, 200));

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Verification query failed.');
      }

      setCurrentStep(5); // Stage 5: Done

      const formattedResult: VerificationResult = {
        eligible: Boolean(data.verification?.eligible),
        taxCompliant: Boolean(data.verification?.taxCompliant ?? true),
        proofHash: data.verification?.proofHash || data.verification?.cryptographic_signature || '0x',
        timestamp: data.verification?.timestamp || new Date().toISOString(),
        queryPredicate: data.verification?.queryPredicate || `${reqPurpose} (Variance & MTI Check)`,
        latencyMs: data.telemetry?.latencyMs || 12.5,
        nationalIdHashPreview: data.telemetry?.nationalIdHashPreview || '',
        source: data.telemetry?.engineSource || 'supabase_cloud',
        requestingMinistry: data.requestingMinistry || activeUseCase.requestingMinistry,
        originatingMinistry: data.originatingMinistry || 'KRA',

        // 2.75% Loophole Fields
        verification_id: data.verification?.verification_id,
        citizen_id: data.verification?.citizen_id || nationalId,
        flags: data.verification?.flags,
        risk_assessment: data.verification?.risk_assessment,
        risk_label: data.verification?.risk_label,
        risk_description: data.verification?.risk_description,
        variance_status: data.verification?.variance_status,
        recommended_action: data.verification?.recommended_action,
        data_exposed_bytes: 0,
        channel_direction: data.verification?.channel_direction || (isViceVersa ? 'KRA_TO_SHIF' : 'SHIF_TO_KRA'),
      };

      setLastResult(formattedResult);

      // Refresh audit logs
      await fetchAuditStream();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution failed';
      setErrorMessage(msg);
      setCurrentStep(0);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--sdep-ink)] text-[var(--sdep-text)]">
      <Header
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenSchema={() => setIsSchemaOpen(true)}
      />

      <main id="sdep-main-container" className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <FiberOpticStage
          useCase={activeUseCase}
          allUseCases={USE_CASES}
          onSelectUseCase={handleSelectUseCase}
          nationalId={nationalId}
          onChangeNationalId={handleSelectCitizenProfile}
          kraPin={kraPin}
          onChangeKraPin={setKraPin}
          declaredIncome={declaredHouseholdIncome}
          onChangeDeclaredIncome={setDeclaredHouseholdIncome}
          mtiScore={mtiProxyScore}
          onChangeMtiScore={setMtiProxyScore}
          reqPurpose={reqPurpose}
          onChangeReqPurpose={setReqPurpose}
          thresholdIncome={thresholdIncome}
          onChangeThresholdIncome={setThresholdIncome}
          isExecuting={isExecuting}
          currentStep={currentStep}
          onExecute={handleExecuteVerification}
          lastResult={lastResult}
          errorMessage={errorMessage}
          onVerifyProof={handleVerifyProofHash}
        />

        <CommandDeck
          logs={logs}
          onRefreshLogs={fetchAuditStream}
          isLoadingLogs={isLoadingLogs}
          activeUseCase={activeUseCase}
          onSelectUseCase={handleSelectUseCase}
          onOpenPitch={() => setIsPitchOpen(true)}
          onOpenSchema={() => setIsSchemaOpen(true)}
        />
      </main>

      <footer className="border-t border-[var(--sdep-border)] bg-[rgba(7,16,24,0.74)] py-4 text-xs text-[var(--sdep-text-subtle)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <span>SDEP verification workspace</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--sdep-success)]" /> Protected records remain with their source ministry</span>
        </div>
      </footer>

      <ProofVerificationDialog
        data={validationModalData}
        onClose={() => setValidationModalData(null)}
        idPrefix="terminal-proof"
      />

      {/* Modals */}
      <ExecutivePitchModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />

      <DatabaseSchemaModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
      />

    </div>
  );
}
