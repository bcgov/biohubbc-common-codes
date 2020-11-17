import * as Knex from "knex";
const DB_SCHEMA = process.env.DB_SCHEMA || 'codes';


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA}, public;
  
      CREATE TABLE ${DB_SCHEMA}.code_header (
        code_header_id serial NOT NULL,
        code_category_id integer,
        code_header_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        code_header_title character varying(40) COLLATE pg_catalog."default" NOT NULL,
        code_header_description character varying(4096) COLLATE pg_catalog."default",
        valid_from timestamp without time zone NOT NULL DEFAULT now(),
        valid_to timestamp without time zone,
        created_at timestamp without time zone NOT NULL DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        created_by_user_id integer,
        updated_by_user_id integer,
        CONSTRAINT code_header_pk PRIMARY KEY (code_header_id),
        CONSTRAINT header_id_name_uq UNIQUE (code_category_id, code_header_name, valid_from, valid_to),
        CONSTRAINT fk_header FOREIGN KEY(code_category_id) REFERENCES code_category(code_category_id)
      );
      
      ALTER TABLE ${DB_SCHEMA}.code_header OWNER TO ${DB_SCHEMA};
      
      COMMENT ON TABLE ${DB_SCHEMA}.code_header IS 'This is the code_header table containing all headers.';
      
      COMMENT ON COLUMN ${DB_SCHEMA}.code_header.code_header_name IS 'Technical name for the code table used in the interface to reference this code table.';
      
      COMMENT ON COLUMN ${DB_SCHEMA}.code_header.code_header_title IS 'Screen title when dropdown is presented.'; 
      
      COMMENT ON COLUMN ${DB_SCHEMA}.code_header.valid_from IS 'Validity of this code from date.';
  
      COMMENT ON COLUMN ${DB_SCHEMA}.code_header.valid_to IS 'Validity of this code until this date';
      
    `);
  }
  
  /**
   * Drop the `code header` table.
   *
   * @export
   * @param {Knex} knex
   * @return {*}  {Promise<void>}
   */
  export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA},public;
  
      DROP TABLE IF EXISTS ${DB_SCHEMA}.code_header;
    `);
  }
  

