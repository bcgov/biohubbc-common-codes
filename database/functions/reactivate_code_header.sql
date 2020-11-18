CREATE OR REPLACE FUNCTION codes.reactivate_code_header(
  p_old_code_header_id integer, 
  p_valid_to timestamp without time zone,
  p_user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_header_id integer;
  declare current_ts timestamp without time zone;
begin
  --
  -- Reactivate a code header

  -- determine current timestamp
  current_ts = now();

  -- Insert a new record with values from the invalidated code record
  INSERT INTO codes.code_header(code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
  SELECT code_category_id, code_header_name, code_header_title, code_header_description, valid_from, p_valid_to, created_at, current_ts, created_by_user_id, p_user_id from codes.code_header
  WHERE code_header_id = p_old_code_header_id returning code_header_id into new_code_header_id;  
 
  return new_code_header_id;
  
end;$function$
;
