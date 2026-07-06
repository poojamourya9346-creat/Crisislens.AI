/** Shared TypeScript type definitions. */

/** Standard API success response envelope (mirrors backend). */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  request_id?: string;
}

/** Standard API error response envelope (mirrors backend). */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  request_id?: string;
}

/** Paginated list response (mirrors backend). */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  request_id?: string;
}

/** Generic ID type for entity references. */
export type EntityId = string;
