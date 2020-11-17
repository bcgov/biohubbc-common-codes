import * as Knex from "knex";
//import csv from "csv-parse";
import parse from "csv-parse";
import { fileURLToPath } from "url";
const fs = require('fs');

const DB_SCHEMA = process.env.DB_SCHEMA || 'codes';


const results = [];

export async function seed(knex: Knex): Promise<void> {

    // await knex.raw(`
    //     set schema '${DB_SCHEMA}';
    //     set search_path = ${DB_SCHEMA}, public;
    
    //     DELETE FROM codes.code;
    //     DELETE FROM codes.code_header;
    //     DELETE FROM codes.code_category;
    // `);

  await knex("code").withSchema('codes').del();
  await knex("code_header").withSchema('codes').del();
  await knex("code_category").withSchema('codes').del();

  await knex.raw('alter sequence codes.code_code_id_seq restart with 1');
  await knex.raw('alter sequence codes.code_header_code_header_id_seq restart with 1');
  await knex.raw('alter sequence codes.code_category_code_category_id_seq restart with 1');
};
