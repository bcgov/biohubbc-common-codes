CREATE OR REPLACE FUNCTION codes.insert_new_code_header(
  p_code_category_id integer,
  p_code_header_name text,
  p_code_header_title text,
  p_code_header_description text, 
  p_valid_to timestamp without time zone,
  p_user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_header_id integer;
  declare current_ts timestamp without time zone;
begin
  --
  -- Update a code

  -- determine current timestamp
  current_ts = now();

  -- Insert a new record with the new values
  INSERT INTO codes.code_header(code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
  VALUES( p_code_category_id, p_code_header_name, p_code_header_title, p_code_header_description, current_ts, p_valid_to, current_ts, current_ts, p_user_id, p_user_id);
  return new_code_header_id;
end;$function$
;
