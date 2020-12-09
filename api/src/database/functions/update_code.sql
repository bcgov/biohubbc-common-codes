CREATE OR REPLACE FUNCTION codes.update_code(
  p_old_code_id integer, 
  p_code_header_id integer,
  p_code_name text,
  p_code_description text, 
  p_code_sort_order integer,
  p_valid_to timestamp without time zone,
  p_user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_id integer;
  declare current_ts timestamp without time zone;
begin
  --
  -- Update a code

  -- determine current timestamp
  current_ts = now();

  -- Expire the current record
  UPDATE codes.code set valid_to = current_ts, updated_at = current_ts, updated_by_user_id = p_user_id WHERE code_id = p_old_code_id;

  -- Insert a new record with the values updated
  INSERT INTO codes.code(code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
  SELECT p_code_header_id, p_code_name, p_code_description, p_code_sort_order, current_ts, p_valid_to, current_ts, current_ts, created_by_user_id, p_user_id from codes.code 
  WHERE code_id = p_old_code_id returning code_id into new_code_id;  
 
  return new_code_id;
end;$function$
;
