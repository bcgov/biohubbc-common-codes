CREATE OR REPLACE FUNCTION codes.get_codes_by_code_table_name(p_code_table_name text)
returns TABLE (category character varying(100), id integer, code character varying(30), description character varying(300))
 LANGUAGE plpgsql
AS $function$

begin
  return query
  SELECT code_category.code_category_name as category, code.code_id AS id, code.code_name AS code, code.code_description AS description
   FROM codes.code
   inner join codes.code_header on code.code_header_id = code_header.code_header_id
   inner join codes.code_category on code_category.code_category_id= code_header.code_category_id
   WHERE code_header.code_header_name = p_code_table_name AND
   (code.valid_to >= now() OR code.valid_to IS NULL)
  ORDER BY code.code_sort_order, code.code_description;
 
end;$function$
;
