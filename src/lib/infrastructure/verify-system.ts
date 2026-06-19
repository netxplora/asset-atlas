import { supabase } from "@/integrations/supabase/client";

export interface VerificationResult {
  category: string;
  item: string;
  status: 'passed' | 'failed' | 'warning';
  message?: string;
  repairable?: boolean;
}

export async function verifySystem(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // 1. Verify Tables
  const requiredTables = [
    'profiles', 'wallets', 'deposits', 'withdrawals', 
    'transactions', 'traders', 'user_copy_trades',
    'investment_plans', 'user_investments', 'app_settings'
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table as any).select('count', { count: 'exact', head: true }).limit(0);
      results.push({
        category: 'Database',
        item: `Table: ${table}`,
        status: error ? 'failed' : 'passed',
        message: error?.message,
        repairable: true
      });
    } catch (e: any) {
      results.push({
        category: 'Database',
        item: `Table: ${table}`,
        status: 'failed',
        message: e.message,
        repairable: true
      });
    }
  }

  // 2. Verify Storage Buckets
  const requiredBuckets = [
    'kyc-documents', 'avatars', 'deposit-proofs', 'trader-avatars'
  ];

  for (const bucket of requiredBuckets) {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket);
      results.push({
        category: 'Storage',
        item: `Bucket: ${bucket}`,
        status: error ? 'failed' : 'passed',
        message: error?.message,
        repairable: true
      });
    } catch (e: any) {
      results.push({
        category: 'Storage',
        item: `Bucket: ${bucket}`,
        status: 'failed',
        message: e.message,
        repairable: true
      });
    }
  }

  return results;
}
