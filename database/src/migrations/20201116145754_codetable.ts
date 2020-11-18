import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'codes';

/**
 * Create the `code` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA}, public;

    CREATE TABLE ${DB_SCHEMA}.code (
        code_id serial NOT NULL,
        code_header_id integer NOT NULL,
        code_name character varying(30) COLLATE pg_catalog."default" NOT NULL,
        code_description character varying(300) COLLATE pg_catalog."default" NOT NULL,
        code_sort_order smallint,
        valid_from timestamp without time zone NOT NULL DEFAULT now(),
        valid_to timestamp without time zone,
        created_at timestamp without time zone NOT NULL DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        created_by_user_id integer,
        updated_by_user_id integer,
        CONSTRAINT code_pk PRIMARY KEY (code_id),
        CONSTRAINT code_id_name_uq UNIQUE (code_header_id, code_name, valid_from, valid_to),
        CONSTRAINT fk_code FOREIGN KEY(code_header_id) REFERENCES code_header(code_header_id)
    );
    
    ALTER TABLE ${DB_SCHEMA}.code OWNER TO ${DB_SCHEMA};
    
    COMMENT ON TABLE ${DB_SCHEMA}.code IS 'This is the generic code table containing all codes.';
    
    COMMENT ON COLUMN ${DB_SCHEMA}.code.valid_from IS 'Validity of this code from date.';

    COMMENT ON COLUMN ${DB_SCHEMA}.code.valid_to IS 'Validity of this code until this date.';
  `);
}

/**
 * Drop the `code` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.code;
  `);
}
