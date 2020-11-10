CREATE OR REPLACE FUNCTION codes.reactivate_code(
  p_old_code_id integer, 
  p_valid_to timestamp without time zone,
  p_user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_id integer;
  declare current_ts timestamp without time zone;
begin
  --
  -- Reactivate a code

  -- determine current timestamp
  current_ts = now();

  -- Insert a new record with values from the invalidated code record
  INSERT INTO codes.code(code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
  SELECT code_header_id, code_name, code_description, code_sort_order, current_ts, p_valid_to, created_at, current_ts, created_by_user_id, p_user_id from codes.code 
  WHERE code_id = p_old_code_id returning code_id into new_code_id;  
 
  return new_code_id;
  
end;$function$
;
