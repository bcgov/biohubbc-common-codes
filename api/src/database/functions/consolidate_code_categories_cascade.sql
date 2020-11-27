CREATE OR REPLACE FUNCTION codes.consolidate_code_categories_cascade(
  p_old_code_category_id integer, 
  p_new_code_category_id integer,
  p_user_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
  declare current_ts timestamp without time zone;
	declare r record;
begin
  --
  -- Update a old code category with new code category id

  -- determine current timestamp
  current_ts = now();
  
  -- Expire the current code_category record
  UPDATE codes.code_category set valid_to = current_ts, updated_at = current_ts, updated_by_user_id = p_user_id WHERE code_category_id = p_old_code_category_id;

  -- Cascade the update codes with new code_header_id
  for r in 
    select *
    from codes.code_header
    where code_category_id = p_old_code_category_id
    and (valid_to is null or valid_to > current_ts);
    loop
      -- update code header id
      perform codes.update_code_header_cascade(r.code_header_id, p_new_code_category_id, r.code_header_name, r.code_header_title, r.code_header_description, r.valid_to, p_user_id);
    end loop;
  
  return true;
end;$function$
;
