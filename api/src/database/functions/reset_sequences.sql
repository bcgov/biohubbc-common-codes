CREATE OR REPLACE FUNCTION codes.reset_sequences()
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
	declare flag boolean;
begin
    perform setval('codes.code_category_code_category_id_seq', (select max(code_category_id)+1 from codes.code_category), false);
    perform setval('codes.code_header_code_header_id_seq', (select max(code_header_id)+1 from codes.code_header), false);
    perform setval('codes.code_code_id_seq', (select max(code_id)+1 from codes.code), false);

    return true;
end;$function$
;
