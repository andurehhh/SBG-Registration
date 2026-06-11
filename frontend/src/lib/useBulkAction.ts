import { useState, useCallback } from 'react'
import { edgeFn } from './api'
import { insertAuditLog } from './auditLog'
import { supabase } from './supabase'
import type { BulkOperationResult } from '../types'

interface UseBulkActionOptions {
  action: 'approve' | 'reject'
  memberIds: string[]
  memberNames: Map<string, string>
  onComplete: () => void
}

interface UseBulkActionReturn {
  execute: () => Promise<BulkOperationResult>
  isRunning: boolean
  progress: { completed: number; total: number }
}

export function useBulkAction({
  action,
  memberIds,
  memberNames,
  onComplete,
}: UseBulkActionOptions): UseBulkActionReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })

  const execute = useCallback(async (): Promise<BulkOperationResult> => {
    const total = memberIds.length
    setIsRunning(true)
    setProgress({ completed: 0, total })

    const results = await Promise.allSettled(
      memberIds.map(async (id) => {
        try {
          await edgeFn.post(action, { id })
          setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }))
          return { memberId: id, success: true as const }
        } catch (err) {
          setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }))
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error'
          return { memberId: id, success: false as const, error: errorMessage }
        }
      })
    )

    const errors: BulkOperationResult['errors'] = []
    let succeeded = 0

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const value = result.value
        if (value.success) {
          succeeded++
        } else {
          errors.push({
            memberId: value.memberId,
            memberName: memberNames.get(value.memberId) ?? 'Unknown',
            error: value.error,
          })
        }
      } else {
        // Promise itself rejected (shouldn't happen with try/catch above, but handle defensively)
        errors.push({
          memberId: 'unknown',
          memberName: 'Unknown',
          error: result.reason?.message ?? 'Unknown error',
        })
      }
    }

    const bulkResult: BulkOperationResult = {
      total,
      succeeded,
      failed: errors.length,
      errors,
    }

    // Insert audit log entry for the bulk action
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      const actorEmail = user?.email ?? 'unknown'
      const actorId = user?.id ?? '00000000-0000-0000-0000-000000000000'

      await insertAuditLog({
        action_type: action === 'approve' ? 'bulk_approve' : 'bulk_reject',
        actor_email: actorEmail,
        actor_id: actorId,
        target_member_id: null,
        target_member_name: null,
        details: {
          count: total,
          member_ids: memberIds,
        },
      })
    } catch {
      // Audit log failure should never block the primary operation
      console.error('Failed to insert bulk action audit log')
    }

    setIsRunning(false)
    onComplete()

    return bulkResult
  }, [action, memberIds, memberNames, onComplete])

  return { execute, isRunning, progress }
}
