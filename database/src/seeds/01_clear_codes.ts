import * as Knex from "knex";
//import csv from "csv-parse";
import parse from "csv-parse";
import { fileURLToPath } from "url";
const fs = require('fs');

const DB_SCHEMA = process.env.DB_SCHEMA || 'codes';


const results = [];

export async function seed(knex: Knex): Promise<void> {

  await knex("code").withSchema(DB_SCHEMA).del();
  await knex("code_header").withSchema(DB_SCHEMA).del();
  await knex("code_category").withSchema(DB_SCHEMA).del();

  await knex.raw('alter sequence ' + DB_SCHEMA + '.code_code_id_seq restart with 1');
  await knex.raw('alter sequence ' + DB_SCHEMA + '.code_header_code_header_id_seq restart with 1');
  await knex.raw('alter sequence ' + DB_SCHEMA + '.code_category_code_category_id_seq restart with 1');
};
