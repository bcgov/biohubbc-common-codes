import Knex from 'knex';
import parse from 'csv-parse';
import * as fs from 'fs';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

export async function seed(knex: Knex): Promise<void> {
  const category_id = await _load_categories(knex);
  //const header_name_map = await _load_headers(knex, category_id);
  //await _load_codes(knex, header_name_map);
}





async function _load_categories(knex: Knex, header_name_map: Map<string, number>): Promise<void> {
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
          code_category_name: dataRow.code_name,
          code_description: dataRow.code_description,
          code_sort_order: 0,
          valid_from: knex.fn.now(),
          created_by_user_id: 1,
          updated_by_user_id: 1
        };
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
