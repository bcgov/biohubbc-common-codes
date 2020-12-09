CREATE OR REPLACE FUNCTION codes.update_code_category_cascade(
  p_old_code_category_id integer, 
  p_code_category_name text,
  p_code_category_title text,
  p_code_category_description text, 
  p_valid_to timestamp without time zone,
  p_user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_category_id integer;
  declare current_ts timestamp without time zone;
	declare r record;
begin
  --
  -- Update a code header

  -- determine current timestamp
  current_ts = now();

  -- Expire the current record
  UPDATE codes.code_category set valid_to = current_ts, updated_at = current_ts, updated_by_user_id = p_user_id WHERE code_category_id = p_old_code_category_id;

  -- Insert a new record with the values updated
  INSERT INTO codes.code_category(code_category_name, code_category_title, code_category_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
  SELECT p_code_category_name, p_code_category_title, p_code_category_description, current_ts, p_valid_to, current_ts, current_ts, p_user_id, p_user_id from codes.code_category
  WHERE code_category_id = p_old_code_category_id returning code_category_id into new_code_category_id;  
  
  --Cascade the update to the associated headers
  for r in 
    select *
    from codes.code_header
    where code_category_id = p_old_code_category_id
    and (valid_to is null or valid_to > current_ts)
  loop
      -- update code header id
      perform codes.update_code_header_cascade(r.code_header_id, new_code_category_id, r.code_header_name, r.code_header_title, r.code_header_description, r.valid_to, p_user_id);
  end loop;
  return new_code_category_id;
  
  
  
  
  -- Cascade the update to associated codes
  --for r in 
   -- select *
    --from codes.code
    --where code_header_id = p_old_code_header_id
    --and (valid_to is null or valid_to > current_ts)
  --loop
      -- update code header id
      --perform codes.update_code(r.code_id, new_code_header_id, r.code_name, r.code_description, r.code_sort_order, r.valid_to, p_user_id);
  --end loop;
 
  --return new_code_header_id;
end;$function$
;
