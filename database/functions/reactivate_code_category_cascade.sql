CREATE OR REPLACE PROCEDURE codes.reactivate_code_category_cascade(category_id integer, user_id integer)
 LANGUAGE plpgsql
AS $procedure$
begin
  -- Un-Expire the code category
  UPDATE codes.code_category set valid_to = NULL, updated_at = now(), updated_by_user_id = user_id 
  WHERE code_category_id = category_id;
  
  -- Un-Expire all the code headers belonging to the code_category
  UPDATE codes.code_header set valid_to = NULL, updated_at = now(), updated_by_user_id = user_id  
  WHERE code_category_id = category_id;
  
  -- Un-Expire all the codes that belong to the just expired header and category
  UPDATE codes.code set valid_to = NULL, updated_at = now(), updated_by_user_id = user_id  
  WHERE code_header_id in (SELECT code_header_id from codes.code_header where code_category_id = category_id);

  commit;
end;$procedure$
;
