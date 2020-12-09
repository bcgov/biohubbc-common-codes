CREATE OR REPLACE FUNCTION codes.consolidate_code_headers_cascade(
  p_old_code_header_id integer, 
  p_new_code_header_id integer,
  p_user_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
  declare current_ts timestamp without time zone;
	declare r record;
begin
  --
  -- Update a old code header with new code header id

  -- determine current timestamp
  current_ts = now();

  -- Expire the current code_header record
  UPDATE codes.code_header set valid_to = current_ts, updated_at = current_ts, updated_by_user_id = p_user_id WHERE code_header_id = p_old_code_header_id; 

  -- Cascade the update codes with new code_header_id
  for r in 
    select *
    from codes.code
    where code_header_id = p_old_code_header_id
    and (valid_to is null or valid_to > current_ts)
  loop
      -- update code header id
      perform codes.update_code(r.code_id, p_new_code_header_id, r.code_name, r.code_description, r.code_sort_order, r.valid_to, p_user_id);
  end loop;
  
  return true;
end;$function$
;
