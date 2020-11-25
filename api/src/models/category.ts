import { SEARCH_LIMIT_MAX, SORT_DIRECTION } from '../constants/misc';
import { parseBase64DataURLString } from './../utils/file-utils';

/**
 * A single media item.
 *
 * @export
 * @interface IMediaItem
 */
export interface IMediaItem {
  media_date?: string;
  description?: string;
  file_name: string;
  encoded_file: string;
}

/**
 * Media object for Data URL base64 encoded files.
 *
 * @export
 * @class MediaBase64
 */
export class MediaBase64 {
  mediaName: string;
  contentType: string;
  contentString: string;
  mediaBuffer: Buffer;
  mediaDescription: string;
  mediaDate: string;

  /**
   * Creates an instance of MediaBase64.
   *
   * @param {IMediaItem} obj
   * @memberof MediaBase64
   */
  constructor(obj: IMediaItem) {
    if (!obj) {
      throw new Error('media was null');
    }

    const base64StringParts = parseBase64DataURLString(obj.encoded_file);

    if (!base64StringParts) {
      throw new Error('media encoded_file could not be parsed');
    }

    this.contentType = base64StringParts.contentType;
    this.contentString = base64StringParts.contentType;
    this.mediaName = obj.file_name;
    this.mediaBuffer = Buffer.from(base64StringParts.contentString, 'base64');
    this.mediaDescription = obj.description || null;
    this.mediaDate = obj.media_date || null;
  }
}

/**
 * Category post request body.
 *
 * @export
 * @class CategoryPostRequestBody
 */
export class CategoryPostRequestBody {
  categoryPostBody: object;
  categoryResponseBody: object;

  category_id: string;

  category_type: string;
  category_subtype: string;

  category_data: object;
  category_type_data: object;
  category_subtype_data: object;

  created_timestamp: string; // ISO string
  received_timestamp: string;
  deleted_timestamp: string; // ISO string

  geoJSONFeature: GeoJSON.Feature[];

  mediaKeys: string[];

  /**
   * Creates an instance of categoryPostRequestBody.
   *
   * @param {*} [obj]
   * @memberof categoryPostRequestBody
   */
  constructor(obj?: any) {
    // Add whole original object for auditing
    this.categoryPostBody = {
      ...obj,
      // Strip out any media base64 strings which would convolute the record
      media:
        (obj.media &&
          obj.media.map((item: IMediaItem) => {
            delete item.encoded_file;
            return item;
          })) ||
        []
    };

    this.category_id = (obj && obj.category_id) || null;

    this.category_type = (obj && obj.category_type) || null;
    this.category_subtype = (obj && obj.category_subtype) || null;

    this.category_data = (obj && obj.form_data && obj.form_data.category_data) || null;
    this.category_type_data = (obj && obj.form_data && obj.form_data.category_type_data) || null;
    this.category_subtype_data = (obj && obj.form_data && obj.form_data.category_subtype_data) || null;

    this.created_timestamp = (obj && obj.created_timestamp) || null;
    this.received_timestamp = new Date().toISOString();
    this.deleted_timestamp = (obj && obj.deleted_timestamp) || null;

    this.geoJSONFeature = (obj && obj.geometry) || [];

    this.mediaKeys = (obj && obj.mediaKeys) || null;
  }
}

/**
 * category search filter criteria object.
 *
 * @export
 * @class categorySearchCriteria
 */
export class CategorySearchCriteria {
  page: number;
  limit: number;
  sort_by: string;
  sort_direction: string;

  category_type: string[];
  category_subtype: string[];

  date_range_start: Date;
  date_range_end: Date;

  search_feature: GeoJSON.Feature;

  column_names: string[];

  /**
   * Creates an instance of categorySearchCriteria.
   *
   * @param {*} [obj]
   * @memberof CategorySearchCriteria
   */
  constructor(obj?: any) {
    this.page = (obj && obj.page && this.setPage(obj.page)) || 0;
    this.limit = (obj && obj.limit && this.setLimit(obj.limit)) || SEARCH_LIMIT_MAX;
    this.sort_by = (obj && obj.sort_by) || '';
    this.sort_direction = (obj && obj.sort_direction) || SORT_DIRECTION.ASC;

    this.category_type = (obj && obj.category_type) || [];
    this.category_subtype = (obj && obj.category_subtype) || [];

    this.date_range_start = (obj && obj.date_range_start) || null;
    this.date_range_end = (obj && obj.date_range_end) || null;

    this.search_feature = (obj && obj.search_feature) || null;

    this.column_names = (obj && obj.column_names) || [];
  }

  setPage(page: number): number {
    if (!page || page < 0) {
      return 0;
    }

    return page;
  }

  setLimit(limit: number): number {
    if (!limit || limit < 0) {
      return 25;
    }

    if (limit > SEARCH_LIMIT_MAX) {
      return SEARCH_LIMIT_MAX;
    }

    return limit;
  }
}
