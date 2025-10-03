import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { DatabaseService } from 'src/database/database.service';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { AuditLogEntry } from './audit-log.type';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let db: Partial<DatabaseService<any>>;
  let logger: Partial<CustomLogger>;

  beforeEach(async () => {
    db = {
      rawQuery: jest.fn(),
    };
    logger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: DatabaseService, useValue: db },
        { provide: CustomLogger, useValue: logger },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    const entry: AuditLogEntry = {
      userId: 'user-1',
      action: 'TEST_ACTION',
      entityType: 'TestEntity',
      entityId: 'entity-1',
      details: { foo: 'bar' },
    };

    it('inserts log and calls logger.log on success', async () => {
      (db.rawQuery as jest.Mock).mockResolvedValueOnce([]);
      await service.logAction(entry);
      expect(db.rawQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_logs'),
        [
          entry.userId,
          entry.action,
          entry.entityType,
          entry.entityId,
          entry.details,
        ],
        String,
      );
      expect(logger.log).toHaveBeenCalledWith(
        `Audit log entry created for user ${entry.userId} action ${entry.action}`,
      );
    });

    it('calls logger.error on failure', async () => {
      const error = new Error('DB error');
      (db.rawQuery as jest.Mock).mockRejectedValueOnce(error);
      await service.logAction(entry);
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to create audit log entry for user ${entry.userId} action ${entry.action}`,
        error,
      );
    });
  });
});
