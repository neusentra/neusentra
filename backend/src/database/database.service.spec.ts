import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { Pool } from 'pg';
import { DbExceptionError } from 'src/errors/db-exception.error';
import * as K from './constants/database.constants';

describe('DatabaseService', () => {
  let service: DatabaseService<any>;
  let poolMock: Partial<Pool>;
  let loggerMock: Partial<CustomLogger>;

  beforeEach(async () => {
    poolMock = {
      query: jest.fn(),
    };
    loggerMock = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: K.POSTGRES_CONNECTION.PROVIDER, useValue: poolMock },
        { provide: CustomLogger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<DatabaseService<any>>(DatabaseService);

    expect(loggerMock.setContext).toHaveBeenCalledWith('DatabaseService');
  });

  describe('runQuery', () => {
    it('transforms results if type is given', async () => {
      poolMock.query = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });
      class DummyDto {
        id!: number;
      }
      const result = await service.runQuery('SELECT 1', [], DummyDto);
      expect(poolMock.query).toHaveBeenCalledWith('SELECT 1', []);
      expect(result[0]).toBeInstanceOf(DummyDto);
      expect(loggerMock.log).toHaveBeenCalled();
    });

    it('returns raw results if no type is provided', async () => {
      const rows = [{ id: 2 }];
      poolMock.query = jest.fn().mockResolvedValue({ rows });
      const result = await service.runQuery('SELECT 2');
      expect(result).toEqual(rows);
    });

    it('logs query execution info', async () => {
      poolMock.query = jest
        .fn()
        .mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      await service.runQuery('SELECT 1');
      expect(loggerMock.log).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 1'),
      );
    });

    it('catches and logs errors then throws DbExceptionError', async () => {
      const error = new Error('fail');
      poolMock.query = jest.fn().mockRejectedValue(error);
      await expect(service.runQuery('BAD QUERY')).rejects.toThrow(
        DbExceptionError,
      );
      expect(loggerMock.error).toHaveBeenCalledWith(error);
    });
  });

  describe('rawQuery', () => {
    it('calls runQuery with all parameters', async () => {
      const dummyType = class {
        id!: number;
      };
      const spy = jest
        .spyOn(service, 'runQuery')
        .mockResolvedValue([{ id: 1 }]);
      const result = await service.rawQuery('RAW QUERY', ['param'], dummyType);
      expect(spy).toHaveBeenCalledWith('RAW QUERY', ['param'], dummyType);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('query', () => {
    it('builds SELECT with all optional clauses and runs query', async () => {
      const dummyType = class {};
      const params = {
        table: 'users',
        query: 'id, name',
        join: 'JOIN orders ON users.id = orders.user_id',
        where: 'id = $1',
        order: 'name DESC',
        limit: 5,
        offset: 10,
        variables: [1],
      };
      const spy = jest.spyOn(service, 'runQuery').mockResolvedValue([]);
      await service.query(params, dummyType);
      const queryArg = spy.mock.calls[0][0];
      expect(queryArg).toEqual(expect.stringContaining('SELECT id, name'));
      expect(queryArg).toEqual(expect.stringContaining('FROM users'));
      expect(queryArg).toEqual(
        expect.stringContaining('JOIN orders ON users.id = orders.user_id'),
      );
      expect(queryArg).toEqual(expect.stringContaining('WHERE id = $1'));
      expect(queryArg).toEqual(expect.stringContaining('ORDER BY name DESC'));
      expect(queryArg).toEqual(expect.stringContaining('LIMIT 5'));
      expect(queryArg).toEqual(expect.stringContaining('OFFSET 10'));
    });

    it('builds minimal SELECT query if only required params', async () => {
      const dummyType = class {};
      const params = {
        table: 'users',
        variables: [],
      };
      const spy = jest.spyOn(service, 'runQuery').mockResolvedValue([]);
      await service.query(params, dummyType);
      const queryArg = spy.mock.calls[0][0];
      expect(queryArg).toEqual(expect.stringContaining('SELECT *'));
      expect(queryArg).toEqual(expect.stringContaining('FROM users'));
    });
  });

  describe('insert', () => {
    it('builds and executes INSERT query', async () => {
      const dummyType = class {};
      const params = {
        table: 'users',
        columns: 'name, email',
        values: '$1, $2',
        variables: ['bob', 'bob@example.com'],
      };
      const spy = jest
        .spyOn(service, 'runQuery')
        .mockResolvedValue([{ id: 5, name: 'bob' }]);
      const res = await service.insert(params, dummyType);
      expect(spy).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *;',
        ['bob', 'bob@example.com'],
        dummyType,
      );
      expect(res).toEqual([{ id: 5, name: 'bob' }]);
    });
  });

  describe('update', () => {
    it('builds and executes UPDATE query with type', async () => {
      const dummyType = class {};
      const params = {
        table: 'users',
        set: 'name = $1',
        where: 'id = $2',
        variables: ['alice', 1],
      };
      const spy = jest
        .spyOn(service, 'runQuery')
        .mockResolvedValue([{ id: 1, name: 'alice' }]);
      const res = await service.update(params, dummyType);
      expect(spy).toHaveBeenCalledWith(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING *;',
        ['alice', 1],
        dummyType,
      );
      expect(res).toEqual([{ id: 1, name: 'alice' }]);
    });

    it('builds and executes UPDATE query without type', async () => {
      const params = {
        table: 'users',
        set: 'name = $1',
        where: 'id = $2',
        variables: ['alice', 1],
      };
      const spy = jest.spyOn(service, 'runQuery').mockResolvedValue([{}]);
      const res = await service.update(params);
      expect(spy).toHaveBeenCalledWith(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING *;',
        ['alice', 1],
        undefined,
      );
      expect(res).toEqual([{}]);
    });
  });

  describe('delete', () => {
    it('builds and executes DELETE query', async () => {
      const dummyType = class {};
      const params = {
        table: 'users',
        where: 'id = $1',
        variables: [1],
      };
      const spy = jest
        .spyOn(service, 'runQuery')
        .mockResolvedValue([{ id: 1 }]);
      const res = await service.delete(params, dummyType);
      expect(spy).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = $1;',
        [1],
        dummyType,
      );
      expect(res).toEqual([{ id: 1 }]);
    });
  });

  describe('transaction', () => {
    it('runs transaction command', async () => {
      const command = 'BEGIN';
      const spy = jest.spyOn(service, 'runQuery').mockResolvedValue(undefined);
      const result = await service.transaction(command);
      expect(spy).toHaveBeenCalledWith(command);
      expect(result).toBeUndefined();
    });
  });
});
