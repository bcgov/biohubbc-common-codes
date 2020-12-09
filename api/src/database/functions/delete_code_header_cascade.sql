CREATE OR REPLACE FUNCTION codes.delete_code_header_cascade(
  p_old_code_header_id integer,  
  p_user_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
  declare current_ts timestamp without time zone;
	declare r record;
begin
  --
  -- Delete a code header by invalidating it (do not actually delete a code header)

  -- determine current timestamp
  current_ts = now();

  -- Expire the current record
  UPDATE codes.code_header set valid_to = current_ts, updated_at = current_ts, updated_by_user_id = p_user_id WHERE code_header_id = p_old_code_header_id;

  -- Cascade delete the associated codes
  for r in 
    select *
    from codes.code
    where code_header_id = p_old_code_header_id
    and (valid_to is null or valid_to > current_ts)
  loop
      -- invalidate code
      perform codes.delete_code(r.code_id, p_user_id);
  end loop;
 
  return true;
end;$function$
;
