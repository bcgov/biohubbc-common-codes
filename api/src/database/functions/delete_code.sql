CREATE OR REPLACE FUNCTION codes.delete_code(
  p_old_code_id integer,
  p_user_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
  declare current_ts timestamp without time zone;
begin
  --
  -- Invalidate a code (do not actually delete the code)

  -- determine current timestamp
  current_ts = now();

  -- Expire the current record
  UPDATE codes.code set valid_to = current_ts, updated_at = current_ts, updated_by_user_id = p_user_id WHERE code_id = p_old_code_id;

  -- confirm that the code delete happened
  return true;
end;$function$
;
