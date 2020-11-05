CREATE OR REPLACE FUNCTION codes.update_code_header_description_cascade(
  p_old_code_header_id integer,
  p_code_header_description text, 
  p_user_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
	declare new_code_header_id integer;
begin
  --
  -- Update a code header description

  select codes.update_code_header_cascade(p_old_code_header_id, code_category_id, code_header_name, code_header_title, p_code_header_description, valid_to, p_user_id)
  into new_code_header_id
  from codes.code_header
  where code_header_id = p_old_code_header_id;
 
  return new_code_header_id;
end;$function$
;
