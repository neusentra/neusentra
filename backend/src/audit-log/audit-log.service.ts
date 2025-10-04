import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { AuditLogEntry } from './audit-log.type';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly db: DatabaseService<any>,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(AuditLogService.name);
  }

  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      await this.db.rawQuery(
        `INSERT INTO neusentra.audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)`,
        [
          entry.userId,
          entry.action,
          entry.entityType,
          entry.entityId,
          entry.details,
        ],
        String,
      );
      this.logger.log(
        `Audit log entry created for user ${entry.userId} action ${entry.action}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create audit log entry for user ${entry.userId} action ${entry.action}`,
        error,
      );
    }
  }
}
