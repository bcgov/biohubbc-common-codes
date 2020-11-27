'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { CategorySearchCriteria } from '../models/category';
import { getCategoriesSQL } from '../queries/category-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('category');

export const GET: Operation = [getCategoriesBySearchFilterCriteria()];

GET.apiDoc = {
  description: 'Fetches all categories based on search criteria.',
  tags: ['category'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Categories search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            page: {
              type: 'number',
              default: 0,
              minimum: 0
            },
            limit: {
              type: 'number',
              default: 25,
              minimum: 0,
              maximum: 100
            },
            sort_by: {
              type: 'string'
            },
            sort_direction: {
              type: 'string',
              enum: ['ASC', 'DESC']
            },
            activity_type: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            date_range_start: {
              type: 'string',
              description: 'Date range start, in YYYY-MM-DD format. Defaults time to start of day.',
              example: '2020-07-30'
            },
            date_range_end: {
              type: 'string',
              description: 'Date range end, in YYYY-MM-DD format. Defaults time to end of day.',
              example: '2020-08-30'
            },
            column_names: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Category get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rows: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      // Don't specify exact object properties, as it will vary, and is not currently enforced anyways
                      // Eventually this could be updated to be a oneOf list, similar to the Post request below.
                    }
                  }
                },
                count: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Fetches all category records based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getCategoriesBySearchFilterCriteria(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'category', message: 'getCategoriesBySearchFilterCriteria', body: req.body });

    const sanitizedSearchCriteria = new CategorySearchCriteria(req.body);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      //const sqlStatement: SQLStatement = getCategoriesSQL(sanitizedSearchCriteria);
      const sqlStatement: SQLStatement = getCategoriesSQL();

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };

      // parse the count from the response
      const count = { count: rows.rows.length && rows.rows[0]['total_rows_count'] } || {};

      // build the return object
      const result = { ...rows, ...count };

      return res.status(200).json(result);
    } catch (error) {
      //defaultLog.debug({ label: 'getCategoriesBySearchFilterCriteria', message: 'error', error });
      defaultLog.debug({ label: 'getCategories', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
