import Knex from 'knex';
import parse from 'csv-parse';
import * as fs from 'fs';
import { timeStamp } from 'console';

const DB_SCHEMA = process.env.DB_SCHEMA || 'codes';

export async function seed(knex: Knex): Promise<void> {
   await _load_categories(knex);
   await _load_headers(knex);
   await _load_codes(knex);
}



async function _load_categories(knex: Knex): Promise<void> {
  const file = __dirname + '/data/code_category.csv';

  const results = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(
        parse({
          columns: true
        })
      )
      .on('data', (dataRow) => {
        const extendedRow = {
          code_category_name: dataRow.code_category_name,
          code_category_title: dataRow.code_category_title,
          code_category_description: dataRow.code_category_description,
          valid_from: new Date(dataRow.valid_from),
          created_at: new Date(dataRow.created_at),
          updated_at: new Date(dataRow.updated_at),
          created_by_user_id: dataRow.created_by_user_id,
          updated_by_user_id: dataRow.updated_by_user_id
        };
        //console.log(extendedRow);
        results.push(extendedRow);
      })
      .on('error', (error) => reject(error))
      .on('end', () => {
        resolve();
      });
  });

  // Insert code entries
  await knex('code_category').withSchema(DB_SCHEMA).insert(results);
}

async function _load_headers(knex: Knex): Promise<void> {
    const file = __dirname + '/data/code_header.csv';
  
    const results = [];
  
    await new Promise((resolve, reject) => {
      fs.createReadStream(file)
        .pipe(
          parse({
            columns: true
          })
        )
        .on('data', (dataRow) => {
          const extendedRow = {
            code_category_id: dataRow.code_category_id,
            code_header_name: dataRow.code_header_name,
            code_header_title: dataRow.code_header_title,
            code_header_description: dataRow.code_header_description,
            valid_from: new Date(dataRow.valid_from),
            valid_to:  dataRow.valid_to? new Date(dataRow.valid_from) : undefined,
            created_at: new Date(dataRow.created_at),
            updated_at: dataRow.updated_at? new Date(dataRow.updated_at) : undefined,
            created_by_user_id: dataRow.created_by_user_id,
            updated_by_user_id: dataRow.updated_by_user_id
          };
          //console.log(extendedRow);
          results.push(extendedRow);
        })
        .on('error', (error) => reject(error))
        .on('end', () => {
          resolve();
        });
    });
  
    // Insert code entries
    await knex('code_header').withSchema(DB_SCHEMA).insert(results);
  }

  async function _load_codes(knex: Knex): Promise<void> {
    const file = __dirname + '/data/code.csv';
  
    const results = [];
  
    await new Promise((resolve, reject) => {
      fs.createReadStream(file)
        .pipe(
          parse({
            columns: true
          })
        )
        .on('data', (dataRow) => {
          const extendedRow = {
            code_header_id: dataRow.code_header_id,
            code_name: dataRow.code_name,
            code_description: dataRow.code_description,
            code_sort_order: dataRow.code_sort_order? parseInt(dataRow.code_sort_order): undefined,
            valid_from: new Date(dataRow.valid_from),
            valid_to:  dataRow.valid_to? new Date(dataRow.valid_from) : undefined,
            created_at: new Date(dataRow.created_at),
            updated_at: dataRow.updated_at? new Date(dataRow.updated_at) : undefined,
            created_by_user_id: dataRow.created_by_user_id,
            updated_by_user_id: dataRow.updated_by_user_id
          };
          //console.log(extendedRow);
          results.push(extendedRow);
        })
        .on('error', (error) => reject(error))
        .on('end', () => {
          resolve();
        });
    });
  
    // Insert code entries
    await knex('code').withSchema(DB_SCHEMA).insert(results);
  }
