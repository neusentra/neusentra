import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { DatabaseService } from 'src/database/database.service';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { AuditLogEntry } from './audit-log.type';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let dbMock: Partial<DatabaseService<any>>;
  let loggerMock: Partial<CustomLogger>;

  beforeEach(async () => {
    dbMock = {
      rawQuery: jest.fn(),
    };

    loggerMock = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: DatabaseService, useValue: dbMock },
        { provide: CustomLogger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should set logger context on initialization', () => {
    expect(loggerMock.setContext).toHaveBeenCalledWith('AuditLogService');
  });

  describe('logAction', () => {
    const sampleEntry: AuditLogEntry = {
      userId: 'user1',
      action: 'CREATE',
      entityType: 'User',
      entityId: '123',
      details: { info: 'sample details' },
    };

    it('should insert audit log entry successfully and log message', async () => {
      (dbMock.rawQuery as jest.Mock).mockResolvedValueOnce(undefined);

      await service.logAction(sampleEntry);

      expect(dbMock.rawQuery).toHaveBeenCalledWith(
        'INSERT INTO neusentra.audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [
          sampleEntry.userId,
          sampleEntry.action,
          sampleEntry.entityType,
          sampleEntry.entityId,
          sampleEntry.details,
        ],
        String,
      );
      expect(loggerMock.log).toHaveBeenCalledWith(
        `Audit log entry created for user ${sampleEntry.userId} action ${sampleEntry.action}`,
      );
    });

    it('should catch error during insert and log error', async () => {
      const error = new Error('DB failed');
      (dbMock.rawQuery as jest.Mock).mockRejectedValueOnce(error);

      await service.logAction(sampleEntry);

      expect(dbMock.rawQuery).toHaveBeenCalled();
      expect(loggerMock.error).toHaveBeenCalledWith(
        `Failed to create audit log entry for user ${sampleEntry.userId} action ${sampleEntry.action}`,
        error,
      );
      // Should NOT call logger.log on error
      expect(loggerMock.log).not.toHaveBeenCalledWith(
        `Audit log entry created for user ${sampleEntry.userId} action ${sampleEntry.action}`,
      );
    });
  });
});