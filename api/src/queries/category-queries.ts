import { SQL, SQLStatement } from 'sql-template-strings';
import { CategoryPostRequestBody, CategorySearchCriteria } from './../models/category';

/**
 * SQL query to insert a new category, and return the inserted record.
 *
 * @param {CategoryPostRequestBody} category
 * @returns {SQLStatement} sql query object
 */
export const postCategorySQL = (category: CategoryPostRequestBody): SQLStatement => {
  if (!category) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO category_incoming_data (
      category_id,
      category_type,
      category_subtype,
      created_timestamp,
      received_timestamp,
      category_payload,
      geog,
      media_keys
    ) VALUES (
      ${category.category_id},
      ${category.category_type},
      ${category.category_subtype},
      ${category.created_timestamp},
      ${category.received_timestamp},
      ${category.categoryPostBody}
  `;

  if (category.geoJSONFeature && category.geoJSONFeature.length) {
    // Note: this is only saving the `geometry` part of the feature, and not any assocaited `properties`.
    const geometry = JSON.stringify(category.geoJSONFeature[0].geometry);

    sqlStatement.append(SQL`
      ,public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
            public.ST_GeomFromGeoJSON(${geometry}),
            4326
          )
        )
      )
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  if (category.mediaKeys) {
    sqlStatement.append(SQL`
      ,${category.mediaKeys}
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  sqlStatement.append(SQL`
    )
    RETURNING
      category_incoming_data_id;
  `);

  return sqlStatement;
};

export interface IPutCategorySQL {
  updateSQL: SQLStatement;
  createSQL: SQLStatement;
}

/**
 * SQL queries to update an existing category record and mark it as `deleted` and to create a new category record.
 *
 * @param {CategoryPostRequestBody} category
 * @return {*}  {IPutCategorySQL} array of sql query objects
 */
export const putCategorySQL = (category: CategoryPostRequestBody): IPutCategorySQL => {
  if (!category) {
    return null;
  }

  // update existing category record
  const updateSQLStatement: SQLStatement = SQL`
    UPDATE category_incoming_data
    SET deleted_timestamp = ${new Date().toISOString()}
    WHERE category_id = ${category.category_id}
    AND deleted_timestamp IS NULL;
  `;

  // create new category record
  const createSQLStatement: SQLStatement = postCategorySQL(category);

  return { updateSQL: updateSQLStatement, createSQL: createSQLStatement };
};

/**
 * SQL query to fetch category records based on search criteria.
 *
 * @param {CategorySearchCriteria} searchCriteria
 * @returns {SQLStatement} sql query object
 */
export const getCategoriesSQL = (searchCriteria: CategorySearchCriteria): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`SELECT`;

  if (searchCriteria.column_names && searchCriteria.column_names.length) {
    // do not include the `SQL` template string prefix, as column names can not be parameterized
    sqlStatement.append(` ${searchCriteria.column_names.join(', ')}`);
  } else {
    // if no column_names specified, select all
    sqlStatement.append(SQL` *`);
  }

  // include the total count of results that would be returned if the limit and offset constraints weren't applied
  sqlStatement.append(SQL`, COUNT(*) OVER() AS total_rows_count`);

  sqlStatement.append(SQL` FROM category_incoming_data WHERE 1 = 1`);

  // don't include deleted or out-dated records
  sqlStatement.append(SQL` AND deleted_timestamp IS NULL`);

  if (searchCriteria.category_subtype && searchCriteria.category_type.length) {
    sqlStatement.append(SQL` AND category_type IN (`);

    // add the first category type, which does not get a comma prefix
    sqlStatement.append(SQL`${searchCriteria.category_type[0]}`);

    for (let idx = 1; idx < searchCriteria.category_type.length; idx++) {
      // add all subsequent category types, which do get a comma prefix
      sqlStatement.append(SQL`, ${searchCriteria.category_type[idx]}`);
    }

    sqlStatement.append(SQL`)`);
  }

  if (searchCriteria.category_subtype && searchCriteria.category_subtype.length) {
    sqlStatement.append(SQL` AND category_subtype IN (`);

    // add the first category subtype, which does not get a comma prefix
    sqlStatement.append(SQL`${searchCriteria.category_subtype[0]}`);

    for (let idx = 1; idx < searchCriteria.category_subtype.length; idx++) {
      // add all subsequent category subtypes, which do get a comma prefix
      sqlStatement.append(SQL`, ${searchCriteria.category_subtype[idx]}`);
    }

    sqlStatement.append(SQL`)`);
  }

  if (searchCriteria.date_range_start) {
    sqlStatement.append(SQL` AND received_timestamp >= ${searchCriteria.date_range_start}::DATE`);
  }

  if (searchCriteria.date_range_end) {
    sqlStatement.append(SQL` AND received_timestamp <= ${searchCriteria.date_range_end}::DATE`);
  }

  if (searchCriteria.search_feature) {
    sqlStatement.append(SQL`
      AND public.ST_INTERSECTS(
        geog,
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
              public.ST_GeomFromGeoJSON(${searchCriteria.search_feature.geometry}),
              4326
            )
          )
        )
      )
    `);
  }

  if (searchCriteria.sort_by) {
    // do not include the `SQL` template string prefix, as column names and sort direction can not be parameterized
    sqlStatement.append(` ORDER BY ${searchCriteria.sort_by} ${searchCriteria.sort_direction}`);
  }

  if (searchCriteria.limit) {
    sqlStatement.append(SQL` LIMIT ${searchCriteria.limit}`);
  }

  if (searchCriteria.page && searchCriteria.limit) {
    sqlStatement.append(SQL` OFFSET ${searchCriteria.page * searchCriteria.limit}`);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};

/**
 * SQL query to fetch a single category record based on its `category_id` and `deleted_timestamp` fields.
 *
 * Note: An category record with a non-null `deleted_timestamp` indicates it has either been deleted or is an out-dated
 * version.  The latest version should have a null `deleted_timestamp`.
 *
 * @param {string} categoryId
 * @returns {SQLStatement} sql query object
 */
export const getCategorySQL = (categoryId: string): SQLStatement => {
  return SQL`
    SELECT * FROM category_incoming_data
    WHERE category_id = ${categoryId}
    AND deleted_timestamp IS NULL;
  `;
};
