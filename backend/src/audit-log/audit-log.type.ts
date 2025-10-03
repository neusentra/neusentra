export interface AuditLogEntry {
  userId?: string;

  action: string;

  entityId?: string;

  entityType?: string;

  details: Record<string, any>;
}
