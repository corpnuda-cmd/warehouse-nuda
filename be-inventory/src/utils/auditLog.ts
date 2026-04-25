import { db } from '../config/db.js'
import { auditLogs } from '../db/schema/audit_logs.js'

interface AuditLogParams {
  userId: string
  action: string       // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT'
  module: string       // 'AUTH' | 'ITEMS' | 'PROCUREMENT' | dsb.
  referenceId?: string
  oldData?: unknown
  newData?: unknown
  ip?: string
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId,
      action: params.action,
      module: params.module,
      referenceId: params.referenceId ?? null,
      oldData: params.oldData ? JSON.stringify(params.oldData) : null,
      newData: params.newData ? JSON.stringify(params.newData) : null,
      ip: params.ip ?? null,
    })
  } catch (error) {
    // Audit log failure tidak boleh break main flow
    console.error('[AuditLog] Failed to write audit log:', error)
  }
}
