import type { VerificationLogItem } from '@/app/api/v1/exchange/verify/route';

declare global {
  var __SDEP_AUDIT_LOGS__: VerificationLogItem[] | undefined;
}

const SEED_LOGS: VerificationLogItem[] = [
  {
    id: 'e1a7b8c2-0001-4c12-89aa-091238475901',
    requesting_ministry: 'Social Health Authority (SHA)',
    originating_ministry: 'KRA Vault',
    verification_type: '2.75% MEANS_TEST_LOOPHOLE_CHECK',
    proof_hash: '0x8f9a2e37c1d4b68903ef8902ca430198de77b5a12368c0923e41b901f4c4e12a',
    query_predicate: 'MTI_Score: 15 (Indigent) vs KRA_Turnover [J. Kamau ID-29384722]',
    result_boolean: false, // FLAG_ASSET_MISMATCH
    tax_compliant: true,
    execution_time_ms: 12.4,
    bytes_transferred: 0,
    protocol_version: 'SDEP-ZKP-v2',
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    source: 'supabase_cloud',
  },
  {
    id: 'e1a7b8c2-0002-4c12-89aa-091238475902',
    requesting_ministry: 'Kenya Revenue Authority (KRA)',
    originating_ministry: 'SHIF Health Vault',
    verification_type: '2.75% STATUTORY_RELIEF_AUDIT (VICE-VERSA)',
    proof_hash: '0x43b890f1e29c01824a76109dc098124ef124098bc1902847a98012e87c0931ab',
    query_predicate: 'SHIF_Standing: COMPLIANT [0 B Medical Data Exposed]',
    result_boolean: true,
    tax_compliant: true,
    execution_time_ms: 10.1,
    bytes_transferred: 0,
    protocol_version: 'SDEP-ZKP-v2',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    source: 'supabase_cloud',
  },
  {
    id: 'e1a7b8c2-0003-4c12-89aa-091238475903',
    requesting_ministry: 'Social Health Authority (SHA)',
    originating_ministry: 'KRA Vault',
    verification_type: '2.75% HOUSEHOLD_VARIANCE_CHECK',
    proof_hash: '0x5c72d1a09ef3247012bc45012948e9102482390abefc19283746192834710293',
    query_predicate: 'Declared: 15,000 KES vs TOT_Turnover [M. Wanjiku ID-99887766]',
    result_boolean: false, // VARIANCE_DETECTED
    tax_compliant: true,
    execution_time_ms: 11.8,
    bytes_transferred: 0,
    protocol_version: 'SDEP-ZKP-v2',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    source: 'supabase_cloud',
  },
  {
    id: 'e1a7b8c2-0004-4c12-89aa-091238475904',
    requesting_ministry: 'Social Health Authority (SHA)',
    originating_ministry: 'KRA Vault',
    verification_type: '2.75% SALARIED_PAYE_VERIFICATION',
    proof_hash: '0x9923847bc01293847e129384bc10293840192834ec0129384712093847102938',
    query_predicate: 'Declared: 42,000 KES == P9_PAYE [A. Ochieng ID-33921001]',
    result_boolean: true, // VERIFIED_MATCH
    tax_compliant: true,
    execution_time_ms: 9.6,
    bytes_transferred: 0,
    protocol_version: 'SDEP-ZKP-v2',
    created_at: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    source: 'supabase_cloud',
  },
];

export function getAuditLogs(): VerificationLogItem[] {
  if (!global.__SDEP_AUDIT_LOGS__ || global.__SDEP_AUDIT_LOGS__.length === 0) {
    global.__SDEP_AUDIT_LOGS__ = [...SEED_LOGS];
  }
  return global.__SDEP_AUDIT_LOGS__;
}

export function addAuditLog(item: VerificationLogItem): void {
  const current = getAuditLogs();
  current.unshift(item);
  if (current.length > 50) {
    current.pop();
  }
}

export function getAuditLogByProof(proofHash: string): VerificationLogItem | undefined {
  const current = getAuditLogs();
  const clean = proofHash.toLowerCase().trim();
  return current.find(
    (log) =>
      log.proof_hash.toLowerCase() === clean ||
      log.proof_hash.toLowerCase().includes(clean) ||
      clean.includes(log.proof_hash.toLowerCase())
  );
}
