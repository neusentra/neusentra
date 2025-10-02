import { Pool } from 'pg';
import { Inject, Injectable, Type } from '@nestjs/common';
import { CustomLogger } from 'src/logger/custom-logger.service';
import * as K from './constants/database.constants';
import { plainToInstance } from 'class-transformer';
import { DbExceptionError } from 'src/errors/db-exception.error';
import {
  DeleteQueryParams,
  InsertQueryParams,
  SelectQueryParams,
  UpdateQueryParams,
} from './interfaces/database.interface';

@Injectable()
export class DatabaseService<T> {
  constructor(
    private readonly logger: CustomLogger,
    @Inject(K.POSTGRES_CONNECTION.PROVIDER)
    private readonly pool: Pool,
  ) {
    this.logger.setContext(DatabaseService.name);
  }

  /**
   * Method for running a query.
   * @param {string} query Query string.
   * @param {any[]} values Query parameters.
   * @param {Type<T>} type Query response DTO.
   * @returns {Promise<any>} Query output.
   */
  async runQuery(
    query: string,
    values: any[] = [],
    type?: Type<T>,
  ): Promise<T[]> {
    const start = Date.now();

    try {
      const result = await this.pool.query(query, values);
      this.logger.log(
        JSON.stringify({
          query: query.replace(/\n/g, ''),
          time: Date.now() - start,
          rows: result.rows?.length || 0,
        }),
      );
      if (type) {
        return plainToInstance(type, result.rows || []) as T[];
      }
      return result.rows;
    } catch (err) {
      this.logger.error(err);
      throw new DbExceptionError(
        err,
        err instanceof Error ? err.message : 'Database error',
      );
    }
  }

  /**
   * Method specifically for running a raw query.
   * @param {string} query Query string.
   * @param {Array<any>} params The values to inject into the query at runtime, preventing SQL injection.
   * @param {Type<T>} type Query response DTO.
   * @returns {Promise<T>} Query output.
   */
  rawQuery(query: string, params: Array<any>, type: Type<T>): Promise<T[]> {
    return this.runQuery(query, params, type);
  }

  /**
   * Method specifically for running a SELECT query.
   * @param {SelectQueryParams} params Select query parameters [SelectQueryParams].
   * @param {Type<T>} type Query response DTO.
   * @returns {Promise<T>} Query output.
   */
  query(params: SelectQueryParams, type: Type<T>): Promise<T[]> {
    if (!params.query) params.query = '* ';
    let dbQuery = `SELECT ${params.query} \n FROM ${params.table}`;

    if (params.join) dbQuery = `\n${dbQuery} ${params.join}`;
    if (params.where) dbQuery = `\n${dbQuery} WHERE ${params.where}`;
    if (params.order) dbQuery = `\n${dbQuery} ORDER BY ${params.order}`;
    if (params.limit) dbQuery = `\n${dbQuery} LIMIT ${params.limit}`;
    if (params.offset) dbQuery = `\n${dbQuery} OFFSET ${params.offset}`;

    return this.runQuery(dbQuery, params.variables, type);
  }

  /**
   * Method specifically for running a INSERT query.
   * @param {InsertQueryParams} params Insert query parameters [InsertQueryParams].
   * @param {Type<T>} type Query response DTO.
   * @returns {Promise<T>} Query output.
   */
  insert(params: InsertQueryParams, type: Type<T>): Promise<T[]> {
    const query =
      'INSERT INTO ' +
      params.table +
      ' (' +
      params.columns +
      ') VALUES (' +
      params.values +
      ') RETURNING *;';
    return this.runQuery(query, params.variables, type);
  }

  /**
   * Method specifically for running a UPDATE query.
   * @param {UpdateQueryParams} params Update query parameters [UpdateQueryParams].
   * @param {Type<T>} type Query response DTO.
   * @returns {Promise<T>} Query output.
   */
  update(params: UpdateQueryParams, type: Type<T>): Promise<T[]> {
    const query =
      'UPDATE ' +
      params.table +
      ' SET ' +
      params.set +
      ' WHERE ' +
      params.where +
      ' RETURNING *;';
    return this.runQuery(query, params.variables, type);
  }

  /**
   * Method specifically for running a DELETE query.
   * @param {DeleteQueryParams} params Delete query parameters [DeleteQueryParams].
   * @param {Type<T>} type Query response DTO.
   * @returns {Promise<T>} Query output.
   */
  delete(params: DeleteQueryParams, type: Type<T>): Promise<T[]> {
    const query =
      'DELETE FROM ' + params.table + ' WHERE ' + params.where + ';';
    return this.runQuery(query, params.variables, type);
  }

  transaction(command: string): Promise<any> {
    return this.runQuery(command, undefined);
  }
}
