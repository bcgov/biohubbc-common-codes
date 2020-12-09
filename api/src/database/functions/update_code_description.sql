CREATE OR REPLACE FUNCTION codes.update_code_description(p_old_code_id integer, p_code_description text, user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_id integer;
begin
  select codes.update_code(p_old_code_id, code_header_id, code_name, p_code_description, code_sort_order, valid_to, user_id)
  into new_code_id
  from codes.code
  where code_id = p_old_code_id;
 
  return new_code_id;
end;$function$
;
