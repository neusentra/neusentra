/**
 * @param {string} table Name of the table.
 * @param {string} query Column names.
 * @param {string} where Where conditions.
 * @param {string} variables The values to inject into the query at runtime, preventing SQL injection.
 * @param {string} join Join operation for query.
 * @param {string} order Sorting order for query.
 * @param {string} limit Response count limit.
 * @param {string} offset Response offset (from where to start?).
 */
export interface SelectQueryParams {
  table: string;
  query: string;
  where?: string;
  variables?: any[];
  join?: string;
  order?: string;
  limit?: string;
  offset?: string;
}

/**
 * @param {string} table Name of the table.
 * @param {string} columns Name of columns.
 * @param {string} values Values to be inserted.
 * @param {string} variables The values to inject into the query at runtime, preventing SQL injection.
 */
export interface InsertQueryParams {
  table: string;
  columns: string;
  values: string;
  variables: any[];
}

/**
 * @param {string} table Name of the table.
 * @param {string} set Update set expression.
 * @param {string} where Where condition.
 * @param {string} variables The values to inject into the query at runtime, preventing SQL injection.
 */
export interface UpdateQueryParams {
  table: string;
  set: string;
  where: string;
  variables: any[];
}

/**
 * @param {string} table Name of the table.
 * @param {string} where Where condition.
 * @param {string} variables The values to inject into the query at runtime, preventing SQL injection.
 */
export interface DeleteQueryParams {
  table: string;
  where: string;
  variables?: any[];
}
