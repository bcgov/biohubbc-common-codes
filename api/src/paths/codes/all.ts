'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from '../../utils/logger';
import { getAllCodeEntities } from '../../utils/code-utils';

const defaultLog = getLogger('codes/all');

export const GET: Operation = [allEntities()];


GET.apiDoc = {
  description: 'Fetches a category based on its primary key.',
  tags: ['category'],
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
 * TODO: Fetches a single category here? record based on its primary key.
 *
 * @return {RequestHandler}
 */

function allEntities(): RequestHandler {
  return async (req, res, next) => {
    return res.status(200).json(await getAllCodeEntities());
  };
}
