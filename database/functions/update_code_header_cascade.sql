CREATE OR REPLACE FUNCTION codes.update_code_header_cascade(
  p_old_code_header_id integer, 
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
	declare r record;
begin
  --
  -- Update a code header

  -- determine current timestamp
  current_ts = now();

  -- Expire the current record
  UPDATE codes.code_header set valid_to = current_ts, updated_at = current_ts, updated_by_user_id = p_user_id WHERE code_header_id = p_old_code_header_id;

  -- Insert a new record with the values updated
  INSERT INTO codes.code_header(code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
  SELECT p_code_category_id, p_code_header_name, p_code_header_title, p_code_header_description, current_ts, p_valid_to, current_ts, current_ts, p_user_id, p_user_id from codes.code_header
  WHERE code_header_id = p_old_code_header_id returning code_header_id into new_code_header_id;  

  -- Cascade the update to assocaited codes
  for r in 
    select *
    from codes.code
    where code_header_id = p_old_code_header_id
    and (valid_to is null or valid_to > current_ts)
  loop
      -- update code header id
      perform codes.update_code(r.code_id, new_code_header_id, r.code_name, r.code_description, r.code_sort_order, r.valid_to, p_user_id);
  end loop;
 
  return new_code_header_id;
end;$function$
;
