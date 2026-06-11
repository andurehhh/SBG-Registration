import { supabase } from './supabase'
import type { AuditLogEntry } from '../types'

export async function insertAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'created_at'>
): Promise<void> {
  try {
    const { error } = await supabase.from('AuditLog').insert(entry)
    if (error) console.error('Audit log insert failed:', error.message)
  } catch (err) {
    console.error('Audit log insert failed:', err)
  }
}
