'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from '../../utils/logger';
import { getAllCodeEntities } from '../../utils/code-utils';
import category_schema from '../../openapi/category-doc.json';
import header_schema from '../../openapi/header-doc.json';
import code_schema from '../../openapi/code-doc.json';

const defaultLog = getLogger('codes/all');

export const GET: Operation = allEntities();


GET.apiDoc = {
  description: 'Fetches all codes.',
  tags: ['category'],
  responses: {
    200: {
      description: 'category get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              categories: {
                type: 'array',
                items: {
                  ...category_schema
                }
              },
              headers: {
                type: 'array',
                items: {
                  ...header_schema
                }
              },
              codes: {
                type: 'array',
                items: {
                  ...code_schema
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

function allEntities(): RequestHandler {
  return async (req, res, next) => {
    return res.status(200).json(await getAllCodeEntities());
  };
}
