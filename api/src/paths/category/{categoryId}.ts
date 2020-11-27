'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from './../../constants/misc';
import { getDBConnection } from './../../database/db';
import { getCategorySQL } from './../../queries/category-queries';
import { getLogger } from './../../utils/logger';

const defaultLog = getLogger('category/{code_category_id}');

export const GET: Operation = [getCategory(), returnCategory()];

GET.apiDoc = {
  description: 'Fetches a single category based on its primary key.',
  tags: ['category'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'categoryId',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'category get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              // Don't specify exact response, as it will vary, and is not currently enforced anyways
              // Eventually this could be updated to be a oneOf list, similar to the Post request below.
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
 * Fetches a single category record based on its primary key.
 *
 * @return {RequestHandler}
 */
function getCategory(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: '{code_category_id}', message: 'getCategory', body: req.params });

    const code_category_id = req.params.categoryId;

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getCategorySQL(code_category_id);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows && response.rows[0]) || null;

      req['category'] = result;
    } catch (error) {
      defaultLog.debug({ label: 'getCategory', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }

    return next();
  };
}

/**
 * Sends a 200 response with JSON contents of `rew.category`.
 *
 * @return {RequestHandler}
 */
function returnCategory(): RequestHandler {
  return async (req, res, next) => {
    return res.status(200).json(req['category']);
  };
}
