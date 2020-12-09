CREATE OR REPLACE FUNCTION codes.get_code_headers_by_category_name(p_code_category_name text)
returns TABLE (id integer, code_table character varying(100), description character varying(300))
 LANGUAGE plpgsql
AS $function$

begin
  return query
  SELECT code_header.code_header_id AS id, code_header.code_header_name AS code_table, code_header.code_header_description AS description
   FROM codes.code_header
   inner join codes.code_category on code_category.code_category_id = code_header.code_category_id
   WHERE code_category.code_category_name = p_code_category_name AND
   (code_header.valid_to >= now() OR code_header.valid_to IS NULL)
  ORDER BY code_header.code_header_name;
 
end;$function$
;
