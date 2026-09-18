import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuditLogs } from '@/lib/auditStore';
import type { VerificationLogItem } from '@/app/api/v1/exchange/verify/route';

export async function GET() {
  // 1. Check if Supabase RPC public.get_audit_stream exists
  try {
    const { data, error } = await supabaseAdmin.rpc('get_audit_stream', { p_limit: 20 });
    if (!error && data && data.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'supabase_cloud',
        logs: data,
      });
    }
  } catch {
    // Fallback to memory store
  }

  // Fallback to persistent global store
  const logs: VerificationLogItem[] = getAuditLogs();
  return NextResponse.json({
    success: true,
    source: 'sovereign_audit_ledger',
    logs,
  });
}
