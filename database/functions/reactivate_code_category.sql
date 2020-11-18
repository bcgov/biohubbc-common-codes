CREATE OR REPLACE FUNCTION codes.reactivate_code_category(
  p_old_code_category_id integer, 
  p_valid_to timestamp without time zone,
  p_user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_category_id integer;
  declare current_ts timestamp without time zone;
begin
  --
  -- Reactivate a code category

  -- determine current timestamp
  current_ts = now();

  -- Insert a new record with values from the invalidated code record
  INSERT INTO codes.code_category(code_category_name, code_category_title, code_category_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
  SELECT code_category_name, code_category_title, code_category_description, valid_from, p_valid_to, created_at, current_ts, created_by_user_id, p_user_id from codes.code_category
  WHERE code_category_id = p_old_code_category_id returning code_category_id into new_code_category_id;  
 
  return new_code_category_id;
  
end;$function$
;
