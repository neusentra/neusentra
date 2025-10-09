import { pgConnectionFactory } from './database.provider';
import * as K from './constants/database.constants';
import configuration from 'src/config/configuration';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { Pool, PoolClient } from 'pg';
import { ConfigType } from '@nestjs/config';

// Mock rxjs timer for immediate emission to avoid delays during retry
jest.mock('rxjs', () => {
  const original = jest.requireActual('rxjs');
  return {
    ...original,
    timer: jest.fn(() => original.of(0)), // immediately emit to skip delays
  };
});

jest.mock('pg');
jest.mock('src/logger/custom-logger.service');

describe('pgConnectionFactory', () => {
  let mockPoolConnect: jest.Mock;
  let mockPool: Partial<Pool>;
  let loggerMock: jest.Mocked<CustomLogger>;

  beforeEach(() => {
    mockPoolConnect = jest.fn();
    mockPool = {
      connect: mockPoolConnect,
    };
    (Pool as jest.Mock).mockImplementation(() => mockPool);

    loggerMock = {
      setContext: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
    } as any;

    (CustomLogger as unknown as jest.Mock).mockImplementation(() => loggerMock);
  });

  it('should create the provider with correct configuration and connect successfully', async () => {
    // Success without rejects
    mockPoolConnect.mockResolvedValue({} as PoolClient);

    const config = {
      pg: {
        host: 'localhost',
        db: 'testdb',
        port: 5432,
        user: 'test',
        pass: 'secret',
      },
    } as ConfigType<typeof configuration>;

    const provider = pgConnectionFactory;
    const poolInstance = await provider.useFactory(config);

    expect(Pool).toHaveBeenCalledWith({
      host: 'localhost',
      database: 'testdb',
      port: 5432,
      user: 'test',
      password: 'secret',
      max: K.MAX_CONNECTION,
    });

    expect(mockPoolConnect).toHaveBeenCalled();

    expect(loggerMock.setContext).toHaveBeenCalledWith(
      K.POSTGRES_CONNECTION.FACTORY,
    );
    expect(loggerMock.log).toHaveBeenCalledWith(
      `Connected to Postgres ${K.POSTGRES_CONNECTION.NAME} successfully!`,
    );

    expect(poolInstance).toBeDefined();
  });

  it('should throw error after max retries and log error', async () => {
    const config = {
      pg: {
        host: 'localhost',
        db: 'testdb',
        port: 5432,
        user: 'test',
        pass: 'secret',
      },
    } as ConfigType<typeof configuration>;

    const error = new Error('conn failed');

    // Always reject to simulate failure beyond retry count
    mockPoolConnect.mockRejectedValue(error);

    const provider = pgConnectionFactory;

    await expect(provider.useFactory(config)).rejects.toThrow(error);
    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.stringContaining(K.DATABASE_CONNECTION),
    );
  });
});
